import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import type { User } from '@app/common/database/schema';
import { LocalAuthGuard } from '../../common/guards/local-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { REFRESH_TOKEN_COOKIE_NAME } from '../../constants';
import { AuthService } from './auth.service';

@Controller('api/v1/authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @Public()
  async login(@CurrentUser() user: User, @Res({ passthrough: true }) res: Response) {
    const authTokens = await this.authService.login(user);
    this.authService.setAuthCookies(res, authTokens);
    return {};
  }

  @Public()
  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME] as string;

    if (!refreshToken) {
      this.authService.clearAuthCookies(res);
      throw new UnauthorizedException('refresh token is required');
    }

    const authTokens = await this.authService.refresh(refreshToken);
    try {
      this.authService.setAuthCookies(res, authTokens);
      return {};
    } catch (error) {
      this.authService.clearAuthCookies(res);
      throw error;
    }
  }

  @Public()
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(req.cookies?.[REFRESH_TOKEN_COOKIE_NAME] as string);
    this.authService.clearAuthCookies(res);
    return {};
  }

  @Get('sessions')
  listSessions(@Req() req: Request, @CurrentUser() user: User) {
    return this.authService.listSessions(user.id, req.sid);
  }

  @Delete('sessions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async terminateSession(@Param('id') id: string, @Req() req: Request, @CurrentUser() user: User) {
    await this.authService.terminateSession(user.id, id, req.sid);
  }
}
