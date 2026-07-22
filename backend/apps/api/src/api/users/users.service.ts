import { Injectable } from '@nestjs/common';
import { UserRepository } from '@app/common/repositories/user/user.repository';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  paginate() {
    return this.userRepository.paginate({
      page: 0,
      pageSize: 10,
    });
  }

  async create() {
    const user = await this.userRepository.create({
      email: '',
      firstName: '',
      lastName: '',
      passwordHash: '',
    });
  }
}
