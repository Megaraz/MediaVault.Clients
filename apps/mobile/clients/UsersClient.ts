import type {
  UserDetailedDto,
  UserLoginDto,
  UserRegisterDto,
  UserUpdateDto,
} from '@mediavault/contracts';
import {
  currentUserOperation,
  deleteUserOperation,
  loginOperation,
  registerOperation,
  userByIdOperation,
  usersOperation,
  validateUserLogin,
  validateUserRegistration,
  validateUserUpdate,
  type ApiOperation,
} from '@mediavault/client-core';
import { clearToken, saveToken } from '../shared/tokenStore';
import { executeMobileOperation, throwOnFailure } from '../shared/apiFetch';

export default class UsersClient {
  async login(credentials: UserLoginDto, signal?: AbortSignal): Promise<UserDetailedDto> {
    throwOnFailure(validateUserLogin(credentials));
    const data = await executeMobileOperation(loginOperation(credentials), signal);
    await saveToken(data.token);
    return data.user;
  }

  async logout(): Promise<void> {
    await clearToken();
  }

  async register(dto: UserRegisterDto, signal?: AbortSignal): Promise<void> {
    throwOnFailure(validateUserRegistration(dto));
    await executeMobileOperation(registerOperation(dto), signal);
  }

  async getCurrentUser(signal?: AbortSignal): Promise<UserDetailedDto> {
    return executeMobileOperation(currentUserOperation(), signal);
  }

  async getUserById(id: string, signal?: AbortSignal): Promise<UserDetailedDto> {
    return executeMobileOperation(userByIdOperation(id), signal);
  }

  async getUsers(pageNumber = 1, pageSize = 10, signal?: AbortSignal): Promise<UserDetailedDto[]> {
    // The current API endpoint is an unpaged collection. Preserve the Android
    // service signature while delegating its authoritative route to the core.
    void pageNumber;
    void pageSize;
    return executeMobileOperation(usersOperation(), signal);
  }

  async createUser(dto: UserRegisterDto, signal?: AbortSignal): Promise<UserDetailedDto> {
    throwOnFailure(validateUserRegistration(dto));
    return executeMobileOperation(createUserOperation(dto), signal);
  }

  async updateUser(id: string, dto: UserUpdateDto, signal?: AbortSignal): Promise<void> {
    throwOnFailure(validateUserUpdate(dto));
    await executeMobileOperation(updateUserOperation(id, dto), signal);
  }

  async deleteUser(id: string, signal?: AbortSignal): Promise<void> {
    await executeMobileOperation(deleteUserOperation(id), signal);
  }
}

// These authenticated administrative endpoints are still Android-only service
// operations. The shared core deliberately exposes no public factories for
// them, so retain their exact established API contracts locally while using the
// core's request execution and safe response mapping.
function createUserOperation(dto: UserRegisterDto): ApiOperation<UserDetailedDto> {
  return Object.freeze({
    method: 'POST',
    path: '/users',
    body: dto,
    responseKind: 'json',
    requiresAuthentication: true,
  });
}

function updateUserOperation(id: string, dto: UserUpdateDto): ApiOperation<void> {
  return Object.freeze({
    method: 'PUT',
    path: `/users/${encodeURIComponent(id)}`,
    body: dto,
    responseKind: 'empty',
    requiresAuthentication: true,
  });
}
