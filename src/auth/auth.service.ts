import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { RegisterUserDto } from '../user/dto/registerUser.dto';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from 'src/user/dto/loginUser.dto';
import { RefreshTokenDto } from 'src/auth/dto/refreshToken.dto';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class AuthService {
  private readonly redisClient: RedisClientType;

  private readonly accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY || '15m';

  private readonly refreshTokenExpiry =
    process.env.REFRESH_TOKEN_EXPIRY || '3d';

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {
    this.redisClient = createClient({
      url: process.env.VALKEY_URL || 'redis://localhost:6379',
    });
    this.redisClient.connect();
  }

  private async generateTokens(payload: {
    id: string;
  }): Promise<{ access_token: string; refresh_token: string }> {
    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: this.accessTokenExpiry,
    });

    const refresh_token = await this.jwtService.signAsync(payload, {
      expiresIn: this.refreshTokenExpiry,
    });

    return {
      access_token,
      refresh_token,
    };
  }

  async registerUser(
    registerUserDto: RegisterUserDto,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const hash = await bcrypt.hash(registerUserDto.password, 10);

    const user = await this.userService.createUser({
      ...registerUserDto,
      password: hash,
    });

    const payload = { id: user._id.toString() };

    return this.generateTokens(payload);
  }

  async login(
    loginUserDto: LoginUserDto,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.userService.findUserByEmail(loginUserDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const isPasswordValid = await bcrypt.compare(
      loginUserDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const payload = { id: user._id.toString() };
    return this.generateTokens(payload);
  }

  async refresh(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<{ access_token: string; refresh_token: string }> {
    try {
      const isBlacklisted = await this.redisClient.get(
        refreshTokenDto.refresh_token,
      );

      if (isBlacklisted) {
        throw new UnauthorizedException('Refresh token has been invalidated.');
      }

      const payload = await this.jwtService.verifyAsync(
        refreshTokenDto.refresh_token,
      );

      const newPayload = { id: payload.id };

      return this.generateTokens(newPayload);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token.');
    }
  }

  async logout(refreshTokenDto: RefreshTokenDto): Promise<void> {
    const expiry = parseInt(this.refreshTokenExpiry) * 24 * 60 * 60; // Convert days to seconds
    await this.redisClient.set(refreshTokenDto.refresh_token, 'blacklisted', {
      EX: expiry,
    });
  }
}
