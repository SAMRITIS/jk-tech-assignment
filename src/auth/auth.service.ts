import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { LoginDto, SignupDto, ForgotPasswordDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { accessTokenExpiresIn } from './auth.module';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.userService.findByEmail(loginDto.email);

    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    const token = this.generateJwt(user);

    return {
      message: 'Login successful',
      token,
    };
  }

  async signup(signupDto: SignupDto) {
    const existingUser = await this.userService.findByEmail(signupDto.email);
    if (existingUser) {
      throw new HttpException('Email already in use', HttpStatus.CONFLICT);
    }
    await this.userService.createUser(
      signupDto.email,
      signupDto.password,
      null,
      signupDto.name,
    );

    return { message: 'Signup successful' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.userService.findByEmail(forgotPasswordDto.email);
    if (!user) {
      throw new HttpException('Email not found', HttpStatus.NOT_FOUND);
    }

    const resetToken = 'GENERATE_RESET_TOKEN_HERE';

    console.log(
      `Password reset link: http://your-app/reset-password?token=${resetToken}`,
    );

    return { message: 'Password reset email sent' };
  }

  private generateJwt(user: any): string {
    const payload = { email: user.email, id: user.id, access: user.access };
    const secret = this.configService.get<string>('jwtSecret');
    const expiresIn = accessTokenExpiresIn;

    return this.jwtService.sign(payload, { secret, expiresIn });
  }
}
