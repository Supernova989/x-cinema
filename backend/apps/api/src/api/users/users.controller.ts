import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { RequireRoles } from '../../common/decorators/require-roles.decorator';

@Controller('api/v1/users')
@RequireRoles('admin')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  paginate() {
    //
  }

  @Get(':id')
  get() {
    //
  }

  @Get(':id')
  create(@Body() dto: any) {
    //
  }

  @Patch(':id')
  patch(@Param('id') id: string) {
    //
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    //
  }
}
