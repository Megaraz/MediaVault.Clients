import * as Crypto from 'expo-crypto';
import type { UserDetailedDto, UserRegisterDto, UserUpdateDto } from '@mediavault/contracts';
import type { User } from '../../models/User';

export class UserDtoMapper {
  public toEntity(dto: UserRegisterDto): User;
  public toEntity(dto: UserDetailedDto): User;
  public toEntity(dto: UserRegisterDto | UserDetailedDto): User {
    if ('password' in dto) {
      return this.mapRegistrationDto(dto);
    }

    return {
      id: dto.id,
      username: dto.username,
      email: dto.email,
      passwordHash: '',
      mediaEntries: [],
      createdAtUtc: dto.createdAtUtc,
      updatedAtUtc: dto.createdAtUtc,
    };
  }

  private mapRegistrationDto(dto: UserRegisterDto): User {
    const now = new Date().toISOString();
    return {
      id: Crypto.randomUUID(),
      username: dto.username,
      email: dto.email,
      passwordHash: dto.password,
      mediaEntries: [],
      createdAtUtc: now,
      updatedAtUtc: now,
    };
  }

  public toEntities(dtos: readonly UserDetailedDto[]): User[] {
    return dtos.map((dto) => this.toEntity(dto));
  }

  public toEntityFromUpdate(id: string, dto: UserUpdateDto): User {
    const now = new Date().toISOString();
    return {
      id,
      username: dto.userName,
      email: dto.email,
      passwordHash: '',
      mediaEntries: [],
      createdAtUtc: now,
      updatedAtUtc: now,
    };
  }
}
