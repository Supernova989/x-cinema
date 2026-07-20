export interface Session {
  userId: string;
  createdAt: string;
  lastActiveAt: string;
  refreshTokenHash: string;
  refreshExpiresAt: string;
}
