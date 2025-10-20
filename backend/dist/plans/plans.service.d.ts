import { Repository } from 'typeorm';
import { Plan } from '../plan.entity';
export declare class PlansService {
    private plansRepository;
    constructor(plansRepository: Repository<Plan>);
    create(plan: Partial<Plan>): Promise<Plan>;
    findAll(): Promise<Plan[]>;
    findOne(id: number): Promise<Plan | null>;
    update(id: number, plan: Partial<Plan>): Promise<Plan | null>;
    remove(id: number): Promise<void>;
}
