import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from '../user/dto/registerUser.dto';
import { LoginUserDto } from 'src/user/dto/loginUser.dto';

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
}
