import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@app/common/database/schema/users.schema';

export const REQUIRE_ROLES_METADATA_KEY = 'REQUIRE_ROLES_METADATA_KEY';

/**
 * Requires the user to have one of the specified roles.
 * @param roles
 */
export const RequireRoles = (...roles: UserRole[]) =>
  SetMetadata(REQUIRE_ROLES_METADATA_KEY, roles ?? []);
