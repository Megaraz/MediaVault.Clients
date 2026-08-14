import { OperationType, type ErrorContext } from 'result-pattern-typescript/legacy';
import UsersClient from '../clients/UsersClient';
import { UserRepo } from '../database/repos/UserRepo';
import { UserDtoMapper } from '../mappers/User/UserDtoMapper';
import { UserEntityMapper } from '../mappers/User/UserEntityMapper';
import type { User } from '../models/User';
import type {
  UserDetailedDto,
  UserMinimalDto,
  UserRegisterDto,
  UserUpdateDto,
} from '../types/dtos/User';
import { featureFlags } from '../shared/featureFlags';
import { hashPassword } from '../shared/passwordHash';
import { UserDtoValidator } from '../validators/User/UserDtoValidator';

export type UserId = string;

export class UserService {
  private readonly userRepository: UserRepo;
  private readonly usersClient: UsersClient;
  private readonly userDtoMapper = new UserDtoMapper();
  private readonly userEntityMapper = new UserEntityMapper();
  private readonly userDtoValidator = new UserDtoValidator();

  public constructor(
    userRepository = new UserRepo(),
    usersClient = new UsersClient(),
  ) {
    this.userRepository = userRepository;
    this.usersClient = usersClient;
  }

  public async getByIdAsync(userId: UserId): Promise<UserDetailedDto> {
    this.validateId(userId, 'getByIdAsync', OperationType.Get);

    if (this.useClientDatabase) {
      return this.userEntityMapper.toDetailedDto(await this.unwrap(
        this.userRepository.getByIdAsync(userId),
      ));
    }

    return this.usersClient.getUserById(userId);
  }

  public async getDetailedCollectionAsync(
    pageNumber = 1,
    pageSize = 10,
  ): Promise<UserDetailedDto[]> {
    const pagination = normalizePagination(pageNumber, pageSize);

    if (this.useClientDatabase) {
      const users = await this.unwrap(
        this.userRepository.getCollectionAsync(pagination.pageNumber, pagination.pageSize),
      );
      return this.userEntityMapper.toDetailedDtoCollection(users);
    }

    return this.usersClient.getUsers(pagination.pageNumber, pagination.pageSize);
  }

  public async getMinimalCollectionAsync(
    pageNumber = 1,
    pageSize = 10,
  ): Promise<UserMinimalDto[]> {
    const pagination = normalizePagination(pageNumber, pageSize);

    if (this.useClientDatabase) {
      const users = await this.unwrap(
        this.userRepository.getCollectionAsync(pagination.pageNumber, pagination.pageSize),
      );
      return this.userEntityMapper.toMinimalDtoCollection(users);
    }

    return (await this.usersClient.getUsers(
      pagination.pageNumber,
      pagination.pageSize,
    )).map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
    }));
  }

  public async createAsync(dto: UserRegisterDto): Promise<UserDetailedDto> {
    this.validateCreateDto(dto);

    if (this.useClientDatabase) {
      const mappedUser = this.userDtoMapper.toEntity(dto);
      const entity: User = {
        ...mappedUser,
        username: mappedUser.username.trim(),
        email: mappedUser.email.trim(),
        passwordHash: await hashPassword(mappedUser.passwordHash),
      };
      return this.userEntityMapper.toDetailedDto(await this.unwrap(
        this.userRepository.createAsync(entity),
      ));
    }

    return this.usersClient.createUser(dto);
  }

  public async updateAsync(userId: UserId, dto: UserUpdateDto): Promise<void> {
    this.validateId(userId, 'updateAsync', OperationType.Update);
    this.validateUpdateDto(dto);

    if (this.useClientDatabase) {
      const existing = await this.unwrap(this.userRepository.getByIdAsync(userId));
      const mappedUpdate = this.userDtoMapper.toEntityFromUpdate(userId, dto);
      await this.unwrapResult(this.userRepository.updateAsync({
        ...existing,
        username: mappedUpdate.username.trim(),
        email: mappedUpdate.email.trim(),
        updatedAtUtc: new Date().toISOString(),
      }));
      return;
    }

    await this.usersClient.updateUser(userId, dto);
  }

  public async deleteAsync(userId: UserId): Promise<void> {
    this.validateId(userId, 'deleteAsync', OperationType.Delete);

    if (this.useClientDatabase) {
      await this.unwrapResult(this.userRepository.deleteAsync(userId));
      return;
    }

    await this.usersClient.deleteUser(userId);
  }

  private get useClientDatabase(): boolean {
    return featureFlags.useClientDatabase;
  }

  private validateCreateDto(dto: UserRegisterDto): void {
    const validation = this.userDtoValidator.validateCreateDto(
      dto,
      this.errorContext('createAsync', OperationType.Create),
    );
    if (!validation.isValid) {
      throw new Error(validation.validationErrors[0]?.userMessage ?? 'Invalid user details.');
    }
  }

  private validateUpdateDto(dto: UserUpdateDto): void {
    const validation = this.userDtoValidator.validateUpdateDto(
      dto,
      this.errorContext('updateAsync', OperationType.Update),
    );
    if (!validation.isValid) {
      throw new Error(validation.validationErrors[0]?.userMessage ?? 'Invalid user details.');
    }
  }

  private validateId(userId: UserId, methodName: string, operation: OperationType): void {
    if (!userId.trim()) {
      throw new Error(`A value for the field 'id' is required and cannot be null or empty.`);
    }
    void this.errorContext(methodName, operation);
  }

  private errorContext(methodName: string, operation: OperationType): ErrorContext {
    return {
      layer: 'Service',
      serviceName: this.constructor.name,
      methodName,
      operation,
      entityName: 'User',
    };
  }

  private async unwrap<T>(
    resultPromise: Promise<{ isSuccess: boolean; value: T; message?: string }>,
  ): Promise<T> {
    const result = await resultPromise;
    if (!result.isSuccess) {
      throw new Error(result.message || 'Local database operation failed.');
    }
    return result.value;
  }

  private async unwrapResult(
    resultPromise: Promise<{ isSuccess: boolean; message?: string }>,
  ): Promise<void> {
    const result = await resultPromise;
    if (!result.isSuccess) {
      throw new Error(result.message || 'Local database operation failed.');
    }
  }
}

function normalizePagination(pageNumber: number, pageSize: number): {
  pageNumber: number;
  pageSize: number;
} {
  return {
    pageNumber: Number.isFinite(pageNumber) ? Math.max(1, Math.floor(pageNumber)) : 1,
    pageSize: Number.isFinite(pageSize) ? Math.min(100, Math.max(1, Math.floor(pageSize))) : 10,
  };
}
