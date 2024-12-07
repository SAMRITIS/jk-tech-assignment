import { Injectable } from '@nestjs/common';
import { UserService } from './user/user.service';

@Injectable()
export class AppService {
  constructor(private readonly userService: UserService) {}

  async onModuleInit() {
    await this.userService.createAdminUser();
  }
  getHello(): string {
    return 'Hello World!';
  }
}
