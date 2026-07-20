import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import redisConfig from '@app/common/config/redis';
import dbConfig from '@app/common/config/db';
import jwtConfig from '@app/common/config/jwt';
import { DatabaseModule } from '@app/common/database/database.module';
import { RedisModule } from '@app/common/redis/redis.module';
import { BullMqModule } from '@app/common/bullmq/bull-mq.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { RolesGuard } from './common/guards/roles.guard';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { MeModule } from './modules/me/me.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { MoviesModule } from './modules/movies/movies.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [redisConfig, dbConfig, jwtConfig],
    }),
    DatabaseModule,
    RedisModule,
    BullMqModule,
    AuthModule,
    MeModule,
    TicketsModule,
    MoviesModule,
  ],
  controllers: [AppController],
  providers: [
    //
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
