import { OperationType, type ErrorContext } from 'result-pattern-typescript';
import UsersClient from '../clients/UsersClient';
import type {
  UserDetailedDto,
  UserLoginDto,
  UserRegisterDto,
} from '../types/dtos/User';
import { UserDtoValidator } from '../validators/User/UserDtoValidator';

export class AuthService {
  private readonly usersClient: UsersClient;
  private readonly userDtoValidator = new UserDtoValidator();

  public constructor(usersClient = new UsersClient()) {
    this.usersClient = usersClient;
  }

  public async loginAsync(credentials: UserLoginDto): Promise<UserDetailedDto> {
    const validation = this.userDtoValidator.validateLoginDto(
      credentials,
      this.errorContext('loginAsync', OperationType.Login),
    );
    this.throwIfInvalid(validation.validationErrors, 'Invalid username/email or password.');
    return this.usersClient.login(credentials);
  }

  public async registerUserAsync(dto: UserRegisterDto): Promise<void> {
    const validation = this.userDtoValidator.validateCreateDto(
      dto,
      this.errorContext('registerUserAsync', OperationType.Create),
    );
    this.throwIfInvalid(validation.validationErrors, 'User register validation failed.');
    await this.usersClient.register(dto);
  }

  public async getCurrentUserAsync(): Promise<UserDetailedDto> {
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
