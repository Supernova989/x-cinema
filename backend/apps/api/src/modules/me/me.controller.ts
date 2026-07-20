import { Controller, Get } from '@nestjs/common';
import { MeService } from './me.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { User } from '@app/common/database/schema';

@Controller('api/v1/me')
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Get()
  getMe(@CurrentUser() user: User) {
    const { id, email, role, firstName, lastName } = user;
    return {
      id,
      email,
      role,
      firstName,
      lastName,
    };
  }
}
