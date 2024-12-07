import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  name: string;
}

export class UpdateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}
