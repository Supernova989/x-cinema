import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { AuthStrategy } from '@app/common/types/auth-strategy';
import { PUBLIC_ACCESS_METADATA_KEY } from '../decorators/public.decorator';
import { User } from '@app/common/database/schema';

@Injectable()
export class JwtAuthGuard extends AuthGuard(AuthStrategy.JWT) {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  override canActivate(ctx: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_ACCESS_METADATA_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(ctx);
  }

  // @ts-ignore
  override handleRequest(err: unknown, user: User | null, info?: Error): User {
    if (err) {
      throw err;
    }

    if (!user) {
      throw new UnauthorizedException(info?.message ?? 'Unauthorized');
    }

    return user;
  }
}
