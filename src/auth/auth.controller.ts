import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly auth: AuthService
    ) { }

    @Post('login')
    async login(@Body() dto: { email: string, password: string }) {
        const { refreshToken: refresh_token, ...user } = await this.auth.validateUser(dto.email, dto.password);

        const { accessToken, refreshToken } = await this.auth.login(user);

        return {
            user,
            accessToken,
            refreshToken,
        }
    }

    @Post('refresh')
    async refresh(@Body() dto: { refreshToken: string }) {
        const { accessToken, refreshToken } = await this.auth.refresh(dto.refreshToken);
        return { accessToken, refreshToken };
    }
}
