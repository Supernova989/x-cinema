import { Module } from '@nestjs/common';
import { SessionService } from '@app/common/sessions/sessions.service';

@Module({
  imports: [],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionsModule {}
