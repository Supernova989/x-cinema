import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtPayload } from '@app/common/types/jwt-payload';
import { JwtService } from '@nestjs/jwt';
import { verify as verifyHash } from '@node-rs/argon2';
import { DatabaseService } from '@app/common/database/database.service';
import { User, users } from '@app/common/database/schema';
import { AuthStrategy } from '@app/common/types/auth-strategy';
import { eq } from 'drizzle-orm';
import { SessionService } from '@app/common/sessions/sessions.service';
import jwtConfig from '@app/common/config/jwt';
import type { ConfigType } from '@nestjs/config';
import { UserCacheService } from '@app/common/cache/user-cache.service';
import type { CookieOptions, Response } from 'express';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME } from '../../constants';
import { AuthTokens } from './types';

@Injectable()
export class AuthService {
  constructor(
    private readonly sessionService: SessionService,
    private readonly cacheService: UserCacheService,
    private readonly jwtService: JwtService,
    private readonly database: DatabaseService,
    @Inject(jwtConfig.KEY) private readonly jwtCfg: ConfigType<typeof jwtConfig>,
  ) {}

  /**
   * Authenticates a user and generates an access token.
   */
  async login(user: User) {
    const sub = user.id;
    const refreshToken = this.createRefreshToken();
    const refreshExpiresAt = this.getRefreshExpiry();

    const sessionId = await this.sessionService.create({
      userId: sub,
      strategy: AuthStrategy.LOCAL,
      refreshTokenHash: this.hashToken(refreshToken),
      refreshExpiresAt,
    });

    return this.createAuthTokens(sub, sessionId, refreshToken);
  }

  /**
   * Refresh the access token using the refresh token.
   */
  async refresh(refreshToken: string): Promise<AuthTokens> {
    const tokenHash = this.hashToken(refreshToken);
    const match = await this.sessionService.getByRefreshTokenHash(tokenHash);

    if (!match || !this.matchesTokenHash(match.session.refreshTokenHash, tokenHash)) {
      if (match) {
        await this.sessionService.terminate(match.sid);
      } else {
        const sessionId =
          await this.sessionService.getSessionIdByRotatedRefreshTokenHash(tokenHash);
        if (sessionId) {
          await this.sessionService.terminate(sessionId);
        }
      }
      throw new UnauthorizedException('invalid refresh token');
    }

    const user = await this.cacheService.getUserById(match.session.userId);

    if (!user?.active) {
      await this.sessionService.terminate(match.sid);
      throw new UnauthorizedException('invalid refresh token');
    }

    const nextRefreshToken = this.createRefreshToken();
    const isRotated: boolean = await this.sessionService.rotateRefreshToken(
      match.sid,
      tokenHash,
      this.hashToken(nextRefreshToken),
      match.session.refreshExpiresAt,
    );

    if (!isRotated) {
      const sessionId = await this.sessionService.getSessionIdByRotatedRefreshTokenHash(tokenHash);
      if (sessionId) {
        await this.sessionService.terminate(sessionId);
      }
      throw new UnauthorizedException('invalid refresh token');
    }

    return this.createAuthTokens(user.id, match.sid, nextRefreshToken);
  }

  async logout(refreshToken?: string): Promise<void> {
    if (!refreshToken) {
      return;
    }

    const session = await this.sessionService.getByRefreshTokenHash(this.hashToken(refreshToken));
    if (session) {
      await this.sessionService.terminate(session.sid);
    }
  }

  async authenticateByJWT(payload: JwtPayload): Promise<User> {
    if (!payload.sid) {
      throw new Error('invalid payload');
    }

    const session = await this.sessionService.get(payload.sid);

    if (!session) {
      throw new UnauthorizedException('session not found');
    }

    const user = await this.cacheService.getUserById(session.userId);

    if (!user) {
      throw new NotFoundException('user not found');
    }
    if (!user.active) {
      throw new ForbiddenException('user is disabled');
    }

    return user;
  }

  async authenticateByCredentials(email: string, password: string): Promise<User> {
    const user = await this.getUserBy('email', email);

    if (!user?.passwordHash || !(await this.safeVerifyPassword(user.passwordHash, password))) {
      throw new UnauthorizedException('user not found / invalid credentials');
    }

    if (!user.active) {
      throw new ForbiddenException('user is disabled');
    }

    return user;
  }

  async listSessions(userId: string, currentSessionId: string | undefined) {
    const sessions = await this.sessionService.listByUserId(userId);

    return sessions.map((s) => ({
      id: s.sid,
      createdAt: s.session.createdAt,
      refreshExpiresAt: s.session.refreshExpiresAt,
      current: s.sid === currentSessionId,
    }));
  }

  async terminateSession(
    userId: string,
    targetSessionId: string,
    currentSessionId: string | undefined,
  ): Promise<void> {
    if (targetSessionId === currentSessionId) {
      throw new BadRequestException('cannot terminate current session');
    }
    const sessionToTerminate = await this.sessionService.get(targetSessionId);
    if (sessionToTerminate?.userId !== userId) {
      throw new BadRequestException('cannot terminate this session');
    }
    return this.sessionService.terminate(targetSessionId);
  }

  /**
   * Safely verifies whether the provided password matches the given hashed password.
   * Handles any errors that might occur during the verification process and returns false in such cases.
   *
   * @param {string} hashed - The hashed password to verify against.
   * @param {string} password - The plain-text password to be verified.
   * @return {Promise<boolean>} A promise that resolves to `true` if the password matches the hash, or `false` otherwise.
   */
  private async safeVerifyPassword(hashed: string, password: string): Promise<boolean> {
    try {
      return await verifyHash(hashed, password);
    } catch {
      return false;
    }
  }

  private async getUserBy(key: keyof User, value: string) {
    return this.database.db.query.users.findFirst({
      where: eq(users[key], value),
    });
  }

  /**
   * Sets authentication cookies for access and refresh tokens in the response object.
   */
  setAuthCookies(response: Response, tokens: AuthTokens) {
    response.cookie(ACCESS_TOKEN_COOKIE_NAME, tokens.accessToken, {
      ...this.getCookieOptions(),
      path: '/',
      maxAge: this.jwtCfg.JWT_EXPIRES_IN_MINUTES * 60 * 1000,
    });
    response.cookie(REFRESH_TOKEN_COOKIE_NAME, tokens.refreshToken, {
      ...this.getCookieOptions(),
      path: '/api/v1/authentication',
      maxAge: this.jwtCfg.REFRESH_TOKEN_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000,
    });
  }

  clearAuthCookies(response: Response) {
    response.clearCookie(ACCESS_TOKEN_COOKIE_NAME, {
      ...this.getCookieOptions(),
      path: '/',
    });
    response.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
      ...this.getCookieOptions(),
      path: '/api/v1/authentication',
    });
  }

  private createAuthTokens(sub: string, sessionId: string, refreshToken: string): AuthTokens {
    const payload: JwtPayload = { sub, sid: sessionId };
    const accessToken = this.jwtService.sign(payload, {
      issuer: this.jwtCfg.JWT_ISSUER,
      audience: this.jwtCfg.JWT_AUDIENCE,
      expiresIn: `${this.jwtCfg.JWT_EXPIRES_IN_MINUTES}m`,
    });
    return {
      accessToken,
      refreshToken,
    };
  }

  private createRefreshToken(): string {
    return randomBytes(48).toString('base64url');
  }

  private getRefreshExpiry(): Date {
    return new Date(Date.now() + this.jwtCfg.REFRESH_TOKEN_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000);
  }

  /**
   * Hashes a given token using the SHA-256 algorithm and returns the hashed value in hexadecimal format.
   */
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  /**
   * Compares two token hashes in a timing-safe manner to determine if they match.
   */
  private matchesTokenHash(expected: string, actual: string): boolean {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(actual));
  }

  private getCookieOptions() {
    return {
      httpOnly: true,
      secure: this.jwtCfg.COOKIE_SECURE,
      sameSite: 'strict' as const,
    } as CookieOptions;
  }
}
