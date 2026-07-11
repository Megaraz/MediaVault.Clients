import type { UserDetailedDto, UserMinimalDto } from '../../types/dtos/User';
import type { User } from '../../models/User';

export class UserEntityMapper {
  public toDetailedDto(entity: User): UserDetailedDto {
    return {
      id: entity.id,
      username: entity.username,
      email: entity.email,
      createdAtUtc: entity.createdAtUtc,
    };
  }

  public toDetailedDtoCollection(entities: readonly User[]): UserDetailedDto[] {
    return entities.map((entity) => this.toDetailedDto(entity));
  }

  public toMinimalDto(entity: User): UserMinimalDto {
    return {
      id: entity.id,
      username: entity.username,
      email: entity.email,
    };
  }

  public toMinimalDtoCollection(entities: readonly User[]): UserMinimalDto[] {
    return entities.map((entity) => this.toMinimalDto(entity));
  }
}
