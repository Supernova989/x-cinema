import { AuthGuard } from '@nestjs/passport';
import { AuthStrategy } from '@app/common/types/auth-strategy';

const STRATEGY_NAME = AuthStrategy.LOCAL;

export class LocalAuthGuard extends AuthGuard(STRATEGY_NAME) {}
