import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from '../user/dto/registerUser.dto';
import { LoginUserDto } from 'src/user/dto/loginUser.dto';
import { RefreshTokenDto } from 'src/auth/dto/refreshToken.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    //logic for user registration --> offloaded to service
    const authTokens = await this.authService.registerUser(registerUserDto);

    return {
      message: 'User registered successfully!',
      ...authTokens,
    };
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    const authTokens = await this.authService.login(loginUserDto);

    return {
      message: 'User logged in successfully!',
      ...authTokens,
    };
  }

  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    const authTokens = await this.authService.refresh(refreshTokenDto);

    return {
      message: 'Token refreshed successfully!',
      ...authTokens,
    };
  }

  @Post('logout')
  async logout(refreshTokenDto: RefreshTokenDto) {
    this.authService.logout(refreshTokenDto);

    return {
      message: 'User logged out successfully!',
    };
  }
}
