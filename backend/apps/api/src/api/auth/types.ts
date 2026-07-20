import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export class LoginDto extends createZodDto(LoginSchema) {}
