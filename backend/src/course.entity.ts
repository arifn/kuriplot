import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

const jsonTransformer = {
  to: (value: string[] | null | undefined) => {
    if (!value || value.length === 0) return null;
    return JSON.stringify(value);
  },
  from: (value: string | null) => {
    if (!value) return [];
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  },
};

export enum CourseType {
  UNI_CORE = 'uni_core',
  FACULTY_CORE = 'faculty_core',
  CS_CORE = 'cs_core',
  STREAM = 'stream',
  ELECTIVE = 'elective',
}

@Entity()
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ name: 'name_id' })
  nameId: string;

  @Column()
  credits: number;

  @Column({
    type: 'simple-enum',
    enum: CourseType,
  })
  type: CourseType;

  @Column({ nullable: true })
  semester: number;

  @Column('float')
  x: number;

  @Column('float')
  y: number;

  @Column('text', { nullable: true, transformer: jsonTransformer })
  topics: string[];

  @Column('text', { nullable: true, transformer: jsonTransformer })
    references: string[];
  
    @ManyToOne(() => User, user => user.courses)
    user: User;
  }