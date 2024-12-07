import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { File } from './file.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([File]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ConfigModule,
    UserModule,
  ],
  controllers: [FileController],
  providers: [FileService, ConfigService],
})
export class FileModule {}
