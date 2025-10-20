import { Repository } from 'typeorm';
import { User } from '../user.entity';
export declare class UserService {
    private usersRepository;
    constructor(usersRepository: Repository<User>);
    findOneByEmail(email: string): Promise<User | undefined>;
    findOneById(id: number): Promise<User | undefined>;
    create(userData: Partial<User>): Promise<User>;
    hashPassword(password: string): Promise<string>;
    comparePasswords(password: string, hashedPassword: string): Promise<boolean>;
}
