import { Global, Module } from '@nestjs/common';
import { UserModule } from '@app/common/repositories/user/user.module';

@Global()
@Module({
  imports: [UserModule],
})
export class RepositoriesModule {}
