import type {
    UserDetailedDto,
    UserLoginDto,
    UserRegisterDto,
} from "@mediavault/contracts";
import {
    currentUserOperation,
    loginOperation,
    registerOperation,
    usersOperation,
    validateUserLogin,
    validateUserRegistration,
} from "@mediavault/client-core";
import {
    clearToken,
    executeWebOperation,
    saveToken,
    throwOnFailure,
} from "./apiFetch";

export default class UsersClient {
    async getUsers(pageNumber: number = 1, pageSize: number = 10, signal?: AbortSignal): Promise<UserDetailedDto[]> {
        // The current API endpoint is an unpaged collection. Keep the existing
        // method signature for web callers while using its authoritative core
        // operation rather than rebuilding an unsupported query string.
        void pageNumber;
        void pageSize;
        return executeWebOperation(usersOperation(), signal);
    }

    async login(credentials: UserLoginDto, signal?: AbortSignal): Promise<UserDetailedDto> {
        throwOnFailure(validateUserLogin(credentials));
        const data = await executeWebOperation(loginOperation(credentials), signal);
        saveToken(data.token);
        return data.user;
    }

    async registerUser(user: UserRegisterDto, signal?: AbortSignal): Promise<void> {
        throwOnFailure(validateUserRegistration(user));
        await executeWebOperation(registerOperation(user), signal);
    }

    async logout(): Promise<void> {
        clearToken();
    }

    async getCurrentUser(signal?: AbortSignal): Promise<UserDetailedDto> {
        return executeWebOperation(currentUserOperation(), signal);
    }
}
