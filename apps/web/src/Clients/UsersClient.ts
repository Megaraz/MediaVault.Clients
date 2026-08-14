import type {
    ErrorResponseBody,
    LoginResponseDto,
    UserDetailedDto,
    UserLoginDto,
    UserRegisterDto,
} from "@mediavault/contracts";
import { apiFetch, saveToken, clearToken } from "./apiFetch";

export default class UsersClient {
    private authBaseUrl = "/auth";
    private usersBaseUrl = "/users";

    private async readResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            let errorMessage = "Request failed";

            try {
                const error = (await response.json()) as ErrorResponseBody;
                errorMessage = error.message || error.code || errorMessage;
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

    async getUsers(pageNumber: number = 1, pageSize: number = 10): Promise<UserDetailedDto[]> {
        const response = await apiFetch(
            `${this.usersBaseUrl}?pageNumber=${pageNumber}&pageSize=${pageSize}`
        );

        return this.readResponse<UserDetailedDto[]>(response);
    }

    async login(credentials: UserLoginDto): Promise<UserDetailedDto> {
        const response = await fetch(this.authBaseUrl + "/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials)
        });

        const data = await this.readResponse<LoginResponseDto>(response);
        saveToken(data.token);
        return data.user;
    }

    async registerUser(user: UserRegisterDto): Promise<void> {
        const response = await fetch(this.authBaseUrl + "/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user)
        });

        await this.readResponse<void>(response);
    }

    async logout(): Promise<void> {
        clearToken();
    }

    async getCurrentUser(): Promise<UserDetailedDto> {
        const response = await apiFetch(this.authBaseUrl + "/me");
        return this.readResponse<UserDetailedDto>(response);
    }
}

