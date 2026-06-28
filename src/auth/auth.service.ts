import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserNotFoundException } from '../users/exceptions/user-not-found.exceptions';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly users: UsersService,
        private readonly jwt: JwtService
    ) { }

    // validate user
    async validateUser(email: string, pass: string) {
        const user = await this.users.getUserByEmail(email);

        if (!user) {
            throw new UserNotFoundException({ email });
        }

        const isPasswordMatch = await bcrypt.compare(pass, user.password);

        if (!isPasswordMatch) {
            throw new UnauthorizedException('Invalid credentials')
        }

        const { password, createdAt, updatedAt, ...safeUser } = user;
        return safeUser;
    }

    // login user
    async login(user: any) {
        const payload = { sub: user.id, email: user.email, role: user.role };
        const accessToken = this.jwt.sign(payload, { expiresIn: '15m' });
        const refreshToken = this.jwt.sign(payload, { expiresIn: '7d' });

        // hash & rotate refresh token
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10)
        await this.users.updateUser(user.id, { refreshToken: hashedRefreshToken });

        return { accessToken, refreshToken };
    }

    // refresh token
    async refresh(token: string) {
        const payload = this.jwt.verify(token);

        if (!payload) {
            throw new UnauthorizedException('Invalid or expired token')
        }

        const user = await this.users.getUserByEmail(payload.email);

        if (!user || !user.refreshToken) {
            throw new UserNotFoundException({ email: payload.email });
        }

        const isValid = await bcrypt.compare(token, user.refreshToken);

        if (!isValid) {
            throw new UnauthorizedException('Invalid token');
        }

        const { accessToken, refreshToken } = await this.login(user);

        return { accessToken, refreshToken };
    }


}
