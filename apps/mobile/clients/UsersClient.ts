import { apiFetch } from '../shared/apiFetch';
import { saveToken, clearToken } from '../shared/tokenStore';
import type {
  ErrorResponseBody,
  LoginResponseDto,
  UserDetailedDto,
  UserLoginDto,
  UserRegisterDto,
  UserUpdateDto,
} from '@mediavault/contracts';

type ApiErrorResponse = Partial<ErrorResponseBody> & { errors?: string[] };

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

  async register(dto: UserRegisterDto): Promise<void> {
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

}
