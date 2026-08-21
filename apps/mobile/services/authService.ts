import { OperationType, type ErrorContext } from 'result-pattern-typescript/legacy';
import UsersClient from '../clients/UsersClient';
import { UserRepo } from '../database/repos/UserRepo';
import { UserDtoMapper } from '../mappers/User/UserDtoMapper';
import { UserEntityMapper } from '../mappers/User/UserEntityMapper';
import type { User } from '../models/User';
import { featureFlags } from '../shared/featureFlags';
import { createOfflineToken, getOfflineUserId } from '../shared/tokenStore';
import { hashPassword, verifyPassword } from '../shared/passwordHash';
import type {
  UserDetailedDto,
  UserLoginDto,
  UserRegisterDto,
} from '@mediavault/contracts';
import { UserDtoValidator } from '../validators/User/UserDtoValidator';

export class AuthService {
  private readonly usersClient: UsersClient;
  private readonly userRepository: UserRepo;
  private readonly userDtoMapper = new UserDtoMapper();
  private readonly userEntityMapper = new UserEntityMapper();
  private readonly userDtoValidator = new UserDtoValidator();

  public constructor(
    usersClient = new UsersClient(),
    userRepository = new UserRepo(),
  ) {
    this.usersClient = usersClient;
    this.userRepository = userRepository;
  }

  public async loginAsync(credentials: UserLoginDto): Promise<AuthenticatedSession> {
    const validation = this.userDtoValidator.validateLoginDto(
      credentials,
      this.errorContext('loginAsync', OperationType.Login),
    );
    this.throwIfInvalid(validation.validationErrors, 'Invalid username/email or password.');

    if (featureFlags.useClientDatabase) {
      const result = await this.userRepository.getByUsernameOrEmailAsync(credentials.usernameOrEmail);
      if (!result.isSuccess || !(await verifyPassword(credentials.password, result.value.passwordHash))) {
        throw new Error('Invalid username/email or password.');
      }
      return {
        token: createOfflineToken(result.value.id),
        user: this.userEntityMapper.toDetailedDto(result.value),
      };
    }

    return this.usersClient.login(credentials);
  }

  public async registerUserAsync(dto: UserRegisterDto): Promise<void> {
    const validation = this.userDtoValidator.validateCreateDto(
      dto,
      this.errorContext('registerUserAsync', OperationType.Create),
    );
    this.throwIfInvalid(validation.validationErrors, 'User register validation failed.');

    if (featureFlags.useClientDatabase) {
      const availability = await this.userRepository.checkRegistrationAvailabilityAsync(dto.username, dto.email);
      if (!availability.isSuccess) throw new Error(availability.message || 'Unable to check registration availability.');
      if (!availability.value.isUserNameAvailable) throw new Error('Username is already taken.');
      if (!availability.value.isEmailAvailable) throw new Error('Email is already registered.');

      const mappedUser = this.userDtoMapper.toEntity(dto);
      const user: User = {
        ...mappedUser,
        username: mappedUser.username.trim(),
        email: mappedUser.email.trim(),
        passwordHash: await hashPassword(mappedUser.passwordHash),
      };
      const result = await this.userRepository.registerUserAsync(user);
      if (!result.isSuccess) throw new Error(result.message || 'Failed to create local account.');
      return;
    }

    await this.usersClient.register(dto);
  }

  public async getCurrentUserAsync(): Promise<UserDetailedDto> {
    if (featureFlags.useClientDatabase) {
      const userId = await getOfflineUserId();
      if (!userId) throw new Error('Not authenticated.');
      const result = await this.userRepository.getByIdAsync(userId);
      if (!result.isSuccess) throw new Error(result.message || 'Not authenticated.');
      return this.userEntityMapper.toDetailedDto(result.value);
    }

    return this.usersClient.getCurrentUser();
  }

  public async logoutAsync(): Promise<void> {
    await this.usersClient.logout();
  }

  private throwIfInvalid(errors: readonly { userMessage: string }[], fallbackMessage: string): void {
    if (errors.length > 0) {
      throw new Error(errors[0]?.userMessage || fallbackMessage);
    }
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
}

export type AuthenticatedSession = {
  readonly token: string;
  readonly user: UserDetailedDto;
};
