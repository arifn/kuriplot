import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './course.entity';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  findAll(): Promise<Course[]> {
    return this.courseRepository.find();
  }

  findOne(id: number): Promise<Course | null> {
    return this.courseRepository.findOneBy({ id });
  }

  async create(course: Partial<Course>): Promise<Course> {
    const newCourse = this.courseRepository.create(course);
    return this.courseRepository.save(newCourse);
  }

  async update(id: number, course: Partial<Course>): Promise<Course | null> {
    await this.courseRepository.update(id, course);
    return this.courseRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    await this.courseRepository.delete(id);
  }
}