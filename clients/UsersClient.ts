import { apiFetch } from '../shared/apiFetch';
import { createOfflineToken, getOfflineUserId, saveToken, clearToken } from '../shared/tokenStore';
import { featureFlags } from '../shared/featureFlags';
import { UserRepo } from '../database/repos/UserRepo';
import { hashPassword, verifyPassword } from '../shared/passwordHash';
import type { User } from '../models/User';
import { UserDtoMapper } from '../mappers/User/UserDtoMapper';
import { UserEntityMapper } from '../mappers/User/UserEntityMapper';
import type {
  UserDetailedDto,
  UserLoginDto,
  UserRegisterDto,
  UserUpdateDto,
} from '../types/dtos/User';

export type { UserDetailedDto, UserLoginDto };
export type UserCreateDto = UserRegisterDto;

type LoginResponseDto = {
  user: UserDetailedDto;
  token: string;
};

type ApiErrorResponse = {
  message?: string;
  errorCode?: string;
  errors?: string[];
};

const API_BASE_URL = process.env.EXPO_PUBLIC_MEDIA_VAULT_API_URL || 'http://localhost:5210';
const userDtoMapper = new UserDtoMapper();
const userEntityMapper = new UserEntityMapper();

export default class UsersClient {
  private authBaseUrl = `${API_BASE_URL}/auth`;
  private usersBaseUrl = `${API_BASE_URL}/users`;

  private async readResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = 'Request failed';

      try {
        const error = (await response.json()) as ApiErrorResponse;
        errorMessage = error.message ?? error.errors?.join(', ') ?? errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  async login(credentials: UserLoginDto): Promise<UserDetailedDto> {
    if (featureFlags.useClientDatabase) {
      const user = await this.getLocalUser(credentials.userNameOrEmail);
      if (!(await verifyPassword(credentials.password, user.passwordHash))) {
        throw new Error('Invalid username/email or password.');
      }
      await saveToken(createOfflineToken(user.id));
      return userEntityMapper.toDetailedDto(user);
    }

    const response = await fetch(`${this.authBaseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    const data = await this.readResponse<LoginResponseDto>(response);
    await saveToken(data.token);
    return data.user;
  }

  async logout(): Promise<void> {
    await clearToken();
  }

  async register(dto: UserCreateDto): Promise<void> {
    if (featureFlags.useClientDatabase) {
      const repo = new UserRepo();
      const availability = await repo.checkRegistrationAvailabilityAsync(dto.username, dto.email);
      if (!availability.isSuccess) {
        throw new Error(availability.message || 'Unable to check registration availability.');
      }
      if (!availability.value.isUserNameAvailable) throw new Error('Username is already taken.');
      if (!availability.value.isEmailAvailable) throw new Error('Email is already registered.');

      const mappedUser = userDtoMapper.toEntity(dto);
      const user: User = {
        ...mappedUser,
        username: mappedUser.username.trim(),
        email: mappedUser.email.trim(),
        passwordHash: await hashPassword(mappedUser.passwordHash),
      };
      const result = await repo.registerUserAsync(user);
      if (!result.isSuccess) {
        throw new Error(result.message || 'Failed to create local account.');
      }
      return;
    }

    const response = await fetch(`${this.authBaseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });

    return this.readResponse<void>(response);
  }

  async getCurrentUser(): Promise<UserDetailedDto> {
    if (featureFlags.useClientDatabase) {
      const userId = await getOfflineUserId();
      if (!userId) throw new Error('Not authenticated.');
      return userEntityMapper.toDetailedDto(await this.getLocalUserById(userId));
    }

    const response = await apiFetch(`${this.authBaseUrl}/me`);
    return this.readResponse<UserDetailedDto>(response);
  }

  async getUserById(id: string): Promise<UserDetailedDto> {
    const response = await apiFetch(`${this.usersBaseUrl}/${id}`);
    return this.readResponse<UserDetailedDto>(response);
  }

  async getUsers(pageNumber = 1, pageSize = 10): Promise<UserDetailedDto[]> {
    const response = await apiFetch(
      `${this.usersBaseUrl}?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    );
    return this.readResponse<UserDetailedDto[]>(response);
  }

  async createUser(dto: UserRegisterDto): Promise<UserDetailedDto> {
    const response = await apiFetch(this.usersBaseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    return this.readResponse<UserDetailedDto>(response);
  }

  async updateUser(id: string, dto: UserUpdateDto): Promise<void> {
    const response = await apiFetch(`${this.usersBaseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    await this.readResponse<void>(response);
  }

  async deleteUser(id: string): Promise<void> {
    const response = await apiFetch(`${this.usersBaseUrl}/${id}`, { method: 'DELETE' });
    await this.readResponse<void>(response);
  }

  private async getLocalUser(usernameOrEmail: string): Promise<User> {
    const result = await new UserRepo().getByUsernameOrEmailAsync(usernameOrEmail);
    if (!result.isSuccess) throw new Error(result.message || 'Invalid username/email or password.');
    return result.value;
  }

  private async getLocalUserById(id: string): Promise<User> {
    const result = await new UserRepo().getByIdAsync(id);
    if (!result.isSuccess) throw new Error(result.message || 'Not authenticated.');
    return result.value;
  }
}
