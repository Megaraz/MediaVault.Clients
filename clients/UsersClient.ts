import { apiFetch } from '../shared/apiFetch';
import { saveToken, clearToken } from '../shared/tokenStore';

export type UserDetailedDto = {
  id: string;
  username: string;
  email: string;
  createdAt: string;
};

export type UserCreateDto = {
  username: string;
  email: string;
  confirmEmail: string;
  password: string;
  confirmPassword: string;
};

export type UserLoginDto = {
  userNameOrEmail: string;
  password: string;
};

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
    const response = await fetch(`${this.authBaseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });

    return this.readResponse<void>(response);
  }

  async getCurrentUser(): Promise<UserDetailedDto> {
    const response = await apiFetch(`${this.authBaseUrl}/me`);
    return this.readResponse<UserDetailedDto>(response);
  }
}
