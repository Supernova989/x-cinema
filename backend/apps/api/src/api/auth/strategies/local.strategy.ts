import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthStrategy } from '@app/common/types/auth-strategy';
import { AuthService } from '../auth.service';
import { User } from '@app/common/database/schema';
import { LoginDto } from '../types';

@Injectable()
export class LocalAdminStrategy extends PassportStrategy(Strategy, AuthStrategy.LOCAL) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email' satisfies keyof LoginDto,
      passwordField: 'password' satisfies keyof LoginDto,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, username: string, password: string): Promise<User> {
    return this.authService.authenticateByCredentials(username, password);
  }
}
