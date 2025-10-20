import { Repository } from 'typeorm';
import { Course } from './course.entity';
export declare class CourseService {
    private courseRepository;
    constructor(courseRepository: Repository<Course>);
    findAll(): Promise<Course[]>;
    findOne(id: number): Promise<Course | null>;
    create(course: Partial<Course>): Promise<Course>;
    update(id: number, course: Partial<Course>): Promise<Course | null>;
    remove(id: number): Promise<void>;
}
