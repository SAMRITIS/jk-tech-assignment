import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { File } from '../file/file.entity';

export enum AccessType {
  ADMIN = 1,
  EDIT = 2,
  VIEW = 3,
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: AccessType,
    nullable: true,
  })
  access: AccessType;

  @OneToMany(() => File, (file) => file.user, { cascade: true })
  files: File[] | undefined;
}
