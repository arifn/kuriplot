import { User } from './user.entity';
export declare class Plan {
    id: number;
    name: string;
    description: string;
    owner: User;
    data: any;
    createdAt: Date;
    updatedAt: Date;
}
