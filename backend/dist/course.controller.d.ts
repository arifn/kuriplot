import { CourseService } from './course.service';
import { Course } from './course.entity';
export declare class CourseController {
    private readonly courseService;
    constructor(courseService: CourseService);
    create(course: Partial<Course>): Promise<Course>;
    findAll(): Promise<Course[]>;
    findOne(id: string): Promise<Course | null>;
    update(id: string, course: Partial<Course>): Promise<Course | null>;
    remove(id: string): Promise<void>;
}
