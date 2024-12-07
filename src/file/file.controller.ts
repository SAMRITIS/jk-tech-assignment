import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FileService } from './file.service';
import { CreateFileDto } from './dto/file.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import * as AWS from 'aws-sdk';
import { Request } from 'express'; // Make sure this uses the updated type
import { Roles } from 'src/auth/roles.decorator';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Paginate, PaginateQuery } from 'nestjs-paginate';

export interface AWSConfig {
  s3BaseURL: string;
  s3BucketName: string;
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
}

@UseGuards(AuthGuard('jwt'))
@Controller('file')
export class FileController {
  s3: AWS.S3;
  bucketName: string;

  constructor(
    private readonly fileService: FileService,
    private configService: ConfigService,
  ) {
    const awsConfig = this.configService.get<AWSConfig>('aws');
    this.s3 = new AWS.S3({
      accessKeyId: awsConfig.accessKeyId,
      secretAccessKey: awsConfig.secretAccessKey,
      region: awsConfig.region,
    });
    this.bucketName = awsConfig.s3BucketName;
  }

  @Post('upload')
  @UseGuards(AuthGuard('jwt'))
  @Roles(1)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    const userId = req.user?.id;
    const key = `${Date.now()}-${file.originalname}`;

    await this.s3
      .upload({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
      .promise();

    const createFileDto: CreateFileDto = {
      key,
      userId,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    };

    return this.fileService.create(createFileDto);
  }

  @Get()
  @Roles(1, 2, 3)
  findAll(@Req() req: Request, @Paginate() query: PaginateQuery) {
    const userId = req.user?.id;
    const role = req.user?.access;
    return this.fileService.findAll(query, userId, role);
  }

  @Get(':id')
  @Roles(1, 2, 3)
  findOne(@Param('id') id: number, @Req() req: Request) {
    const userId = req.user?.id;
    const role = req.user?.access;
    return this.fileService.findOne(id, userId, role);
  }

  @Delete(':id')
  @Roles(1)
  remove(@Param('id') id: number, @Req() req: Request) {
    const userId = req.user?.id;
    const role = req.user?.access;
    return this.fileService.remove(id, userId, role);
  }
}
