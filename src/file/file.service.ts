import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './file.entity';
import { CreateFileDto } from './dto/file.dto';
import { ConfigService } from '@nestjs/config';
import { AWSConfig } from './file.controller';
import { UserService } from 'src/user/user.service';
import {
  FilterOperator,
  paginate,
  Paginated,
  PaginateQuery,
} from 'nestjs-paginate';

@Injectable()
export class FileService {
  private bucket: string;
  private region: string;
  private baseUrl: string;

  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    this.bucket = this.configService.get<string>('AWS_BUCKET');
    this.region = this.configService.get<string>('AWS_REGION');
    this.baseUrl = `https://${this.bucket}.s3.${this.region}.amazonaws.com/`;
  }

  async create(createFileDto: CreateFileDto): Promise<File> {
    const { userId, ...createFileData } = createFileDto;
    const user = await this.userService.findOne(userId);
    const file = this.fileRepository.create({
      ...createFileData,
      user,
    });

    return this.fileRepository.save(file);
  }

  async findAll(
    query: PaginateQuery,
    userId: string,
    role: number,
  ): Promise<Paginated<File>> {
    const queryBuilder = this.fileRepository
      .createQueryBuilder('file')
      .leftJoinAndSelect('file.user', 'user');

    if (!role || ![1, 2, 3].includes(role)) {
      queryBuilder.where('file.user_id = :userId', { userId });
    }

    return paginate<File>(query, queryBuilder, {
      sortableColumns: ['id', 'originalName', 'uploadedAt', 'size'],
      searchableColumns: ['originalName', 'mimeType'],
      filterableColumns: {
        mimeType: [FilterOperator.EQ],
        size: [FilterOperator.GTE, FilterOperator.LTE],
      },
    });
  }

  async findOne(
    id: number,
    userId: string,
    role: number,
  ): Promise<File & { url: string }> {
    const awsConfig = this.configService.get<AWSConfig>('aws');
    const baseUrl = awsConfig.s3BaseURL;
    const bucketName = awsConfig.s3BucketName;

    const file = await this.fileRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!file) {
      throw new ForbiddenException('File not found');
    }

    if (role === 1 || role === 2 || role === 3 || file.user.id === userId) {
      return {
        ...file,
        url: `${baseUrl}${bucketName}/${file.key}`,
      };
    } else {
      throw new ForbiddenException('Access denied');
    }
  }

  async remove(id: number, userId: string, role: number): Promise<void> {
    const file = await this.findOne(id, userId, role);
    await this.fileRepository.remove(file);
  }
}
