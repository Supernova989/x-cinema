import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SessionsModule } from '@app/common/sessions/sessions.module';
import { LocalAdminStrategy } from './strategies/local.strategy';
import { CacheModule } from '@app/common/cache/cache.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigType } from '@nestjs/config';
import jwtConfig from '@app/common/config/jwt';

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [jwtConfig.KEY],
      useFactory: (config: ConfigType<typeof jwtConfig>) => {
        return {
          secret: config.JWT_SECRET,
          signOptions: {
            expiresIn: `${config.JWT_EXPIRES_IN_MINUTES}m`,
          },
        };
      },
    }),
    SessionsModule,
    CacheModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LocalAdminStrategy],
  exports: [AuthService],
})
export class AuthModule {}
