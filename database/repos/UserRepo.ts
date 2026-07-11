import {
  Error as ResultErrorFactory,
  OperationType,
  Result,
  ResultOf,
} from 'result-pattern-typescript';
import type { User } from '../../models/User';
import { getOfflineDatabase } from '../SQLite';
import {
  cancelled,
  errorContext,
  isOperationCancelled,
  isUniqueConstraintError,
  queryFailure,
  saveFailure,
  saveFailureResult,
} from './repoHelpers';

export class UserRepo {
  public async createAsync(entity: User): Promise<ResultOf<User>> {
    const context = errorContext(this.constructor.name, 'createAsync', OperationType.Create, 'User');
    try {
      const db = await getOfflineDatabase();
      const now = new Date().toISOString();
      const created = { ...entity, mediaEntries: [], createdAtUtc: now, updatedAtUtc: now };
      await db.runAsync(
        `INSERT INTO "Users" ("Id", "Username", "Email", "PasswordHash", "CreatedAtUtc", "UpdatedAtUtc")
         VALUES (?, ?, ?, ?, ?, ?)`,
        created.id, created.username, created.email, created.passwordHash, created.createdAtUtc, created.updatedAtUtc,
      );
      return ResultOf.success(created);
    } catch (exception) {
      if (isOperationCancelled(exception)) return cancelled(context);
      if (isUniqueConstraintError(exception)) return ResultOf.failure(ResultErrorFactory.conflict(context));
      return saveFailure(context, exception);
    }
  }

  public async registerUserAsync(entity: User): Promise<Result> {
    const context = errorContext(this.constructor.name, 'registerUserAsync', OperationType.Create, 'User');
    try {
      const db = await getOfflineDatabase();
      await db.runAsync(
        `INSERT INTO "Users" ("Id", "Username", "Email", "PasswordHash", "CreatedAtUtc", "UpdatedAtUtc")
         VALUES (?, ?, ?, ?, ?, ?)`,
        entity.id, entity.username, entity.email, entity.passwordHash, entity.createdAtUtc, entity.updatedAtUtc,
      );
      return Result.success();
    } catch (exception) {
      if (isOperationCancelled(exception)) return Result.failure(ResultErrorFactory.cancelled(context));
      if (isUniqueConstraintError(exception)) return Result.failure(ResultErrorFactory.conflict(context));
      return saveFailureResult(context, exception);
    }
  }

  public async getByIdAsync(id: string): Promise<ResultOf<User>> {
    const context = errorContext(this.constructor.name, 'getByIdAsync', OperationType.Get, 'User');
    try {
      const db = await getOfflineDatabase();
      const row = await db.getFirstAsync<UserRow>('SELECT * FROM "Users" WHERE "Id" = ?', id);
      if (!row) return ResultOf.failure(ResultErrorFactory.notFound(context));
      return ResultOf.success(mapUser(row));
    } catch (exception) {
      if (isOperationCancelled(exception)) return cancelled(context);
      return queryFailure(context, exception);
    }
  }

  public async getCollectionAsync(pageNumber: number, pageSize: number): Promise<ResultOf<readonly User[]>> {
    const context = errorContext(this.constructor.name, 'getCollectionAsync', OperationType.GetCollection, 'User');
    try {
      const db = await getOfflineDatabase();
      const rows = await db.getAllAsync<UserRow>(
        `SELECT * FROM "Users" ORDER BY "CreatedAtUtc" LIMIT ? OFFSET ?`,
        pageSize, Math.max(0, pageNumber - 1) * pageSize,
      );
      return ResultOf.success(rows.map(mapUser));
    } catch (exception) {
      if (isOperationCancelled(exception)) return cancelled(context);
      return queryFailure(context, exception);
    }
  }

  public async updateAsync(updatedEntity: User): Promise<Result> {
    const context = errorContext(this.constructor.name, 'updateAsync', OperationType.Update, 'User');
    try {
      const db = await getOfflineDatabase();
      const existing = await db.getFirstAsync<UserRow>('SELECT * FROM "Users" WHERE "Id" = ?', updatedEntity.id);
      if (!existing) return Result.failure(ResultErrorFactory.notFound(context));
      await db.runAsync(
        `UPDATE "Users" SET "Username" = ?, "Email" = ?, "PasswordHash" = ?, "UpdatedAtUtc" = ?
         WHERE "Id" = ?`,
        updatedEntity.username, updatedEntity.email, updatedEntity.passwordHash,
        new Date().toISOString(), updatedEntity.id,
      );
      return Result.success();
    } catch (exception) {
      if (isOperationCancelled(exception)) return Result.failure(ResultErrorFactory.cancelled(context));
      if (isUniqueConstraintError(exception)) return Result.failure(ResultErrorFactory.conflict(context));
      return saveFailureResult(context, exception);
    }
  }

  public async deleteAsync(id: string): Promise<Result> {
    const context = errorContext(this.constructor.name, 'deleteAsync', OperationType.Delete, 'User');
    try {
      const db = await getOfflineDatabase();
      const result = await db.runAsync('DELETE FROM "Users" WHERE "Id" = ?', id);
      if (result.changes === 0) return Result.failure(ResultErrorFactory.notFound(context));
      return Result.success();
    } catch (exception) {
      if (isOperationCancelled(exception)) return Result.failure(ResultErrorFactory.cancelled(context));
      return saveFailureResult(context, exception);
    }
  }

  public async existsAsync(id: string): Promise<ResultOf<boolean>> {
    const context = errorContext(this.constructor.name, 'existsAsync', OperationType.Get, 'User');
    try {
      const db = await getOfflineDatabase();
      const row = await db.getFirstAsync<{ exists: number }>(
        'SELECT EXISTS(SELECT 1 FROM "Users" WHERE "Id" = ?) AS exists', id,
      );
      if (!row?.exists) return ResultOf.failure(ResultErrorFactory.notFound(context));
      return ResultOf.success(true);
    } catch (exception) {
      if (isOperationCancelled(exception)) return cancelled(context);
      return queryFailure(context, exception);
    }
  }

  public async checkRegistrationAvailabilityAsync(
    username: string,
    email: string,
  ): Promise<ResultOf<{ isUserNameAvailable: boolean; isEmailAvailable: boolean }>> {
    const context = errorContext(this.constructor.name, 'checkRegistrationAvailabilityAsync', OperationType.Get, 'User');
    try {
      const db = await getOfflineDatabase();
      const rows = await db.getAllAsync<Pick<UserRow, 'Username' | 'Email'>>(
        `SELECT "Username", "Email" FROM "Users" WHERE "Username" = ? OR "Email" = ?`,
        username.trim(), email.trim(),
      );
      return ResultOf.success({
        isUserNameAvailable: !rows.some((row) => row.Username === username.trim()),
        isEmailAvailable: !rows.some((row) => row.Email === email.trim()),
      });
    } catch (exception) {
      if (isOperationCancelled(exception)) return cancelled(context);
      return queryFailure(context, exception);
    }
  }

  public async getByUsernameOrEmailAsync(usernameOrEmail: string): Promise<ResultOf<User>> {
    const context = errorContext(
      this.constructor.name, 'getByUsernameOrEmailAsync', OperationType.Get, 'User', 'UsernameOrEmail',
    );
    try {
      const db = await getOfflineDatabase();
      const row = await db.getFirstAsync<UserRow>(
        'SELECT * FROM "Users" WHERE "Username" = ? OR "Email" = ?',
        usernameOrEmail.trim(), usernameOrEmail.trim(),
      );
      if (!row) return ResultOf.failure(
        ResultErrorFactory.unauthorized(context),
        'Invalid username/email or password.',
      );
      return ResultOf.success(mapUser(row));
    } catch (exception) {
      if (isOperationCancelled(exception)) return cancelled(context);
      return queryFailure(context, exception);
    }
  }
}

interface UserRow {
  Id: string;
  Username: string;
  Email: string;
  PasswordHash: string;
  CreatedAtUtc: string;
  UpdatedAtUtc: string;
}

function mapUser(row: UserRow): User {
  return {
    id: row.Id,
    username: row.Username,
    email: row.Email,
    passwordHash: row.PasswordHash,
    mediaEntries: [],
    createdAtUtc: row.CreatedAtUtc,
    updatedAtUtc: row.UpdatedAtUtc,
  };
}
