import type {
    LoginResponseDto,
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
    executeWebOperation,
    throwOnFailure,
} from "./apiFetch";
import { clearSession } from "../Shared/sessionLifecycle";

export default class UsersClient {
    async getUsers(pageNumber: number = 1, pageSize: number = 10, signal?: AbortSignal): Promise<UserDetailedDto[]> {
        // The current API endpoint is an unpaged collection. Keep the existing
        // method signature for web callers while using its authoritative core
        // operation rather than rebuilding an unsupported query string.
        void pageNumber;
        void pageSize;
        return executeWebOperation(usersOperation(), signal);
    }

    async login(credentials: UserLoginDto, signal?: AbortSignal): Promise<LoginResponseDto> {
        throwOnFailure(validateUserLogin(credentials));
        return executeWebOperation(loginOperation(credentials), signal);
    }

    async registerUser(user: UserRegisterDto, signal?: AbortSignal): Promise<void> {
        throwOnFailure(validateUserRegistration(user));
        await executeWebOperation(registerOperation(user), signal);
    }

    async logout(): Promise<void> {
        await clearSession();
    }

    async getCurrentUser(signal?: AbortSignal): Promise<UserDetailedDto> {
        return executeWebOperation(currentUserOperation(), signal);
    }
}
