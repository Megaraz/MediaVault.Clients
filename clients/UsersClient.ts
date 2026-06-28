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

type ApiErrorResponse = {
  message?: string;
  errorCode?: string;
  errors?: string[];
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

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
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });

    return this.readResponse<UserDetailedDto>(response);
  }

  async logout(): Promise<void> {
    const response = await fetch(`${this.authBaseUrl}/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    return this.readResponse<void>(response);
  }

  async register(dto: UserCreateDto): Promise<UserDetailedDto> {
    const response = await fetch(`${this.usersBaseUrl}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(dto),
    });

    return this.readResponse<UserDetailedDto>(response);
  }

  async getCurrentUser(): Promise<UserDetailedDto> {
    const response = await fetch(`${this.usersBaseUrl}/me`, {
      credentials: 'include',
    });

    return this.readResponse<UserDetailedDto>(response);
  }
}
