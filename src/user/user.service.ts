import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RegisterUserDto } from 'src/user/dto/registerUser.dto';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async createUser(registerUserDto: RegisterUserDto) {
    try {
      return await this.userModel.create(registerUserDto);
    } catch (error: unknown) {
      console.log('Error while creating user: ', error);

      const err = error as { code: number };
      const DUPLICATE_KEY_ERROR_CODE = 11000;

      if (err.code === DUPLICATE_KEY_ERROR_CODE) {
        throw new ConflictException(
          'User with this email already exists! Please login to continue',
        );
      }

      throw new InternalServerErrorException('Internal server error');
    }
  }

  async findUserByEmail(email: string) {
    try {
      return this.userModel.findOne({ email }).exec();
    } catch (error) {
      console.log('Error while finding user by email: ', error);
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
