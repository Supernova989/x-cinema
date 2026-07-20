import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { RedisService } from '@app/common/redis/redis.service';
import { Session } from '@app/common/types/session';
import { CreateSessionInput } from '@app/common/sessions/types';
import { ROTATE_REFRESH_TOKEN_SCRIPT } from '@app/common/sessions/scripts';

@Injectable()
export class SessionService {
  constructor(private readonly redis: RedisService) {}

  /**
   * Retrieves a session by its ID.
   */
  async get(sessionId: string): Promise<Session | null> {
    const sessionKey = this.getSessionKey(sessionId);

    const json = await this.redis.client.get(sessionKey);

    if (!json) {
      return null;
    }
    const session = JSON.parse(json) as Session;
    const refreshExpiresAt = new Date(session.refreshExpiresAt);

    if (Number.isNaN(refreshExpiresAt.getTime()) || refreshExpiresAt <= new Date()) {
      await this.terminate(sessionId);
      return null;
    }

    return session;
  }

  /**
   * Creates a new session.
   */
  async create(input: CreateSessionInput): Promise<string> {
    const { userId, refreshTokenHash, refreshExpiresAt } = input;
    const sessionId = randomUUID();

    const now = new Date();

    const session: Session = {
      userId,
      createdAt: now.toISOString(),
      lastActiveAt: now.toISOString(),
      refreshTokenHash,
      refreshExpiresAt: refreshExpiresAt.toISOString(),
    };

    await this.redis.client.set(
      //
      this.getSessionKey(sessionId),
      JSON.stringify(session),
      {
        expiration: {
          type: 'EX',
          value: this.getTTL(session.refreshExpiresAt),
        },
      },
    );

    await this.redis.client.sAdd(
      //
      this.getUserSessionsKey(input.userId),
      sessionId,
    );

    await this.redis.client.set(this.getRefreshTokenKey(refreshTokenHash), sessionId, {
      expiration: {
        type: 'EX',
        value: this.getTTL(session.refreshExpiresAt),
      },
    });

    return sessionId;
  }

  /**
   * Finds a session from the hash of its opaque refresh token.
   * */
  async getByRefreshTokenHash(
    refreshTokenHash: string,
  ): Promise<{ sid: string; session: Session } | null> {
    const sessionId = await this.redis.client.get(this.getRefreshTokenKey(refreshTokenHash));
    if (!sessionId) {
      return null;
    }

    const session = await this.get(sessionId);
    if (!session) {
      await this.redis.client.del(this.getRefreshTokenKey(refreshTokenHash));
      return null;
    }

    return { sid: sessionId, session };
  }

  /**
   * Returns the session that previously used a rotated refresh token.
   * */
  async getSessionIdByRotatedRefreshTokenHash(refreshTokenHash: string): Promise<string | null> {
    return this.redis.client.get(this.getRotatedRefreshTokenKey(refreshTokenHash));
  }

  /**
   * Atomically validates and rotates a session's refresh-token hash.
   *
   * @Returns true if the refresh token hash is valid and rotated successfully, false otherwise.
   * */
  async rotateRefreshToken(
    sessionId: string,
    currentRefreshTokenHash: string,
    nextRefreshTokenHash: string,
    refreshExpiresAt: string,
  ): Promise<boolean> {
    const now = new Date();
    const result = await this.redis.client.eval(ROTATE_REFRESH_TOKEN_SCRIPT, {
      keys: [
        this.getSessionKey(sessionId),
        this.getRefreshTokenKey(currentRefreshTokenHash),
        this.getRotatedRefreshTokenKey(currentRefreshTokenHash),
        this.getRefreshTokenKey(nextRefreshTokenHash),
      ],
      arguments: [
        currentRefreshTokenHash,
        nextRefreshTokenHash,
        sessionId,
        now.toISOString(),
        now.toISOString(),
        this.getTTL(refreshExpiresAt).toString(),
      ],
    });

    return result === 1;
  }

  /**
   * Retrieves all sessions for a user.
   */
  async listByUserId(userId: string) {
    const sessionIds = await this.redis.client.sMembers(this.getUserSessionsKey(userId));

    const sessions = await Promise.all(
      sessionIds.map(async (sid) => {
        const json = await this.redis.client.get(this.getSessionKey(sid));
        if (!json) {
          // Session has expired, clean up
          await this.redis.client.sRem(
            //
            this.getUserSessionsKey(userId),
            sid,
          );
          return null;
        }

        return {
          sid,
          session: JSON.parse(json) as Session,
        };
      }),
    );

    return sessions.filter(Boolean) as Array<{ sid: string; session: Session }>;
  }

  /**
   * Deletes a session by its ID.
   */
  async terminate(sessionId: string): Promise<void> {
    const json = await this.redis.client.get(this.getSessionKey(sessionId));
    if (!json) {
      return;
    }
    const session = JSON.parse(json) as Session;

    await this.redis.client.del(this.getSessionKey(sessionId));
    await this.redis.client.del(this.getRefreshTokenKey(session.refreshTokenHash));

    await this.redis.client.sRem(
      //
      this.getUserSessionsKey(session.userId),
      sessionId,
    );
  }

  /**
   * Generates the Redis key for a session.
   */
  private getSessionKey(sessionId: string) {
    return `session:${sessionId}`;
  }

  private getUserSessionsKey(userId: string): string {
    return `user-sessions:${userId}`;
  }

  private getRefreshTokenKey(refreshTokenHash: string): string {
    return `refresh-token:${refreshTokenHash}`;
  }

  private getRotatedRefreshTokenKey(refreshTokenHash: string): string {
    return `rotated-refresh-token:${refreshTokenHash}`;
  }

  /**
   * Calculates the time-to-live (TTL) in seconds based on the provided expiration date.
   */
  private getTTL(expiresAt: string): number {
    return Math.max(1, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000));
  }
}
