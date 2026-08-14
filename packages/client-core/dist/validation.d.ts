import type { MediaEntryCreateDto, MediaEntryUpdateDto, UserLoginDto, UserRegisterDto, UserUpdateDto } from '@mediavault/contracts';
import { type Result } from 'result-pattern-typescript';
export declare function validateUserLogin(dto: UserLoginDto | null | undefined): Result<void>;
export declare function validateUserRegistration(dto: UserRegisterDto | null | undefined): Result<void>;
export declare function validateUserUpdate(dto: UserUpdateDto | null | undefined): Result<void>;
export declare function validateMediaEntry(dto: MediaEntryCreateDto | MediaEntryUpdateDto | null | undefined): Result<void>;
//# sourceMappingURL=validation.d.ts.map