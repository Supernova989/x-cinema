export interface CreateSessionInput {
  userId: string;
  strategy: string;
  refreshTokenHash: string;
  refreshExpiresAt: Date;
}
