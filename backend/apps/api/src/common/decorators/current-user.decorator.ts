import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { User } from '@app/common/database/schema';

interface Options {
  //
}

export const CurrentUser = createParamDecorator((options: Options = {}, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<{ user: User }>();

  if (!request.user) {
    throw new UnauthorizedException();
  }

  return request.user;
});
