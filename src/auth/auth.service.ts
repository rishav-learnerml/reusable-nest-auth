import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { RegisterUserDto } from './registerUser.dto';
import bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async registerUser(registerUserDto: RegisterUserDto) {
    // logic for user registration
    // 1. check if email already exists
    // 2. hash password
    // 3. save user to database
    // 4. generate jwt access and refresh token
    // 5. send tokens to user (usually in cookies)

    const hash = await bcrypt.hash(registerUserDto.password, 10);
    const user = await this.userService.createUser({
      ...registerUserDto,
      password: hash,
    });

    return { message: 'User registered successfully', user };
  }
}
