import { Injectable, NotFoundException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { RegisterUserDto } from '../user/dto/registerUser.dto';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from 'src/user/dto/loginUser.dto';
import { NotFoundError } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async registerUser(
    registerUserDto: RegisterUserDto,
  ): Promise<{ access_token: string; refresh_token: string }> {
    // logic for user registration
    // 1. check if email already exists done
    // 2. hash password done
    // 3. save user to database done
    // 4. generate jwt access and refresh token
    // 5. send tokens to user (usually in cookies)

    const hash = await bcrypt.hash(registerUserDto.password, 10);
    const user = await this.userService.createUser({
      ...registerUserDto,
      password: hash,
    });

    const payload = { id: user._id };

    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    const refresh_token = await this.jwtService.signAsync(payload, {
      expiresIn: '3d',
    });

    return {
      access_token,
      refresh_token,
    };
  }

  async login(
    loginUserDto: LoginUserDto,
  ): Promise<{ access_token: string; refresh_token: string }> {
    //1. validate user credentials
    const user = await this.userService.findUserByEmail(loginUserDto.email);

    if (!user) {
      throw new NotFoundException('Invalid credentials - email not found!');
    }

    const isPasswordValid = await bcrypt.compare(
      loginUserDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new NotFoundException('Invalid credentials - wrong password!');
    }

    //2. generate jwt access and refresh token
    const payload = { id: user._id };

    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    const refresh_token = await this.jwtService.signAsync(payload, {
      expiresIn: '3d',
    });

    return {
      access_token,
      refresh_token,
    };
  }
}
