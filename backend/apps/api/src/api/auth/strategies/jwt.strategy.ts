import { Request } from 'express';
import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import jwtConfig from '@app/common/config/jwt';
import type { ConfigType } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { AuthStrategy } from '@app/common/types/auth-strategy';
import moment from 'moment';
import { JwtPayload } from '@app/common/types/jwt-payload';
import { ACCESS_TOKEN_COOKIE_NAME } from '../../../constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, AuthStrategy.JWT) {
  constructor(
    @Inject(jwtConfig.KEY) private readonly jwtCfg: ConfigType<typeof jwtConfig>,
    private readonly authService: AuthService,
  ) {
    super({
      secretOrKey: jwtCfg.JWT_SECRET,
      issuer: jwtCfg.JWT_ISSUER,
      audience: jwtCfg.JWT_AUDIENCE,
      algorithms: ['HS256'],
      passReqToCallback: true,
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.[ACCESS_TOKEN_COOKIE_NAME] ?? null,
      ]),
    });
  }

  getNow() {
    return moment();
  }

  // isExpired(timestamp: number) {
  //   return this.getNow().isAfter(moment(timestamp * 1000));
  // }

  async validate(req: Request, payload: JwtPayload) {
    req.sid = payload.sid; // store the session ID in the request object for later use
    return this.authService.authenticateByJWT(payload);
  }
}
