import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccessType, User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { FilterOperator, paginate, PaginateQuery } from 'nestjs-paginate';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
  ) {}

  async findByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  async createUser(
    email: string,
    password: string,
    accessType: AccessType | null,
    name: string,
  ): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = this.userRepository.create({
      email,
      password: hashedPassword,
      access: accessType,
      name,
    });

    return await this.userRepository.save(newUser);
  }

  async createAdminUser() {
    const adminEmail = this.configService.get<string>('admin.email');
    const existingAdmin = await this.userRepository.findOne({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(
        this.configService.get<string>('admin.password'),
        10,
      );
      const newAdmin = this.userRepository.create({
        email: adminEmail,
        password: hashedPassword,
        access: this.configService.get<number>('admin.accessType'),
        name: 'Admin',
      });

      await this.userRepository.save(newAdmin);
      console.log('Admin user created.');
    }
  }

  async findAll(query: PaginateQuery) {
    return paginate<User>(query, this.userRepository, {
      sortableColumns: ['id', 'name', 'email', 'access'],
      searchableColumns: ['name', 'email'],
      filterableColumns: {
        access: [FilterOperator.EQ],
      },
      select: ['id', 'name', 'email', 'access'],
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, name } = createUserDto;

    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new HttpException('Email already in use', HttpStatus.CONFLICT);
    }

    const newUser = this.userRepository.create({
      email,
      password,
      name,
    });

    await this.userRepository.save(newUser);
    return newUser;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    const { email, name } = updateUserDto;

    if (email) {
      const existingUser = await this.userRepository.findOne({
        where: { email },
      });
      if (existingUser && existingUser.id !== user.id) {
        throw new HttpException('Email already in use', HttpStatus.CONFLICT);
      }
    }

    user.email = email;
    user.name = name;

    await this.userRepository.save(user);
    return user;
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }
}
