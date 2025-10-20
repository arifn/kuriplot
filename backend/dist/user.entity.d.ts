import { Course } from './course.entity';
import { Plan } from './plan.entity';
export declare class User {
    id: number;
    username: string;
    email: string;
    password: string;
    provider: string;
    providerId: string;
    createdAt: Date;
    updatedAt: Date;
    courses: Course[];
    plans: Plan[];
}
