import { SetMetadata } from '@nestjs/common';

export const PUBLIC_ACCESS_METADATA_KEY = 'PUBLIC_ACCESS_METADATA_KEY';

/**
 * Marks a route as public, allowing unauthenticated access.
 */
export const Public = () => SetMetadata(PUBLIC_ACCESS_METADATA_KEY, true);
