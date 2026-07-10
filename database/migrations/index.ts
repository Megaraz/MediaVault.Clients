import initialCreate from './20260703175601_InitialCreate';
import ratingConstraintRemove from './20260703181005_RatingConstraintRemove';
import type { AppDbMigration } from './types';

export const appDbMigrations: AppDbMigration[] = [
  initialCreate,
  ratingConstraintRemove,
];
