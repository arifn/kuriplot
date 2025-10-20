import { User } from './user.entity';
export declare enum CourseType {
    UNI_CORE = "uni_core",
    FACULTY_CORE = "faculty_core",
    CS_CORE = "cs_core",
    STREAM = "stream",
    ELECTIVE = "elective"
}
export declare class Course {
    id: number;
    name: string;
    nameId: string;
    credits: number;
    type: CourseType;
    semester: number;
    x: number;
    y: number;
    topics: string[];
    references: string[];
    user: User;
}
