import { IsEmail, IsString } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  firstname: string;

  @IsString()
  lastname: string;

  @IsString()
  password: string;

  @IsEmail()
  email: string;
}
