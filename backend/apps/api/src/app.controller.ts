import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { CurrentUser } from './common/decorators/current-user.decorator';
import { RequireRoles } from './common/decorators/require-roles.decorator';
import { UserRole } from '@app/common/database/schema/users.schema';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('test')
  @RequireRoles()
  async test(@CurrentUser() user) {
    return user;
  }
}
