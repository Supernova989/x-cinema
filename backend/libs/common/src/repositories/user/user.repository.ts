import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@app/common/repositories/base.repository';
import { users } from '@app/common/database/schema';

@Injectable()
export class UserRepository extends BaseRepository<typeof users, string> {
  protected readonly table = users;
  protected readonly idColumn = users.id;
}
