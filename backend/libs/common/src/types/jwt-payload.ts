import { JwtPayload as JwtP } from 'jsonwebtoken';

export interface JwtPayload extends JwtP {
  /**
   * Session reference.
   */
  sid?: string;
  /**
   * If issued for single-sign-on.
   */
  sso?: boolean;
}
