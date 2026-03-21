import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { CurrentUser } from '@common/decorators/current-user.decorator';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    @Throttle({ short: { limit: 3, ttl: 60000 } })
    @ApiOperation({ summary: 'Registrar nuevo usuario' })
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @Throttle({ short: { limit: 5, ttl: 60000 } })
    @UseGuards(AuthGuard('local'))
    @ApiOperation({ summary: 'Iniciar sesión — retorna JWT' })
    login(
        @CurrentUser()
        user: { id: string; email: string; roles: string[]; adminCountries: string[] },
    ) {
        return this.authService.login(user.id, user.email, user.roles, user.adminCountries);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Renovar access token con refresh token' })
    refresh(@Body('refreshToken') refreshToken: string) {
        return this.authService.refresh(refreshToken);
    }
}
