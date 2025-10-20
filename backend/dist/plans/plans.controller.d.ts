import { PlansService } from './plans.service';
import { Plan } from '../plan.entity';
export declare class PlansController {
    private readonly plansService;
    constructor(plansService: PlansService);
    create(plan: Partial<Plan>): Promise<Plan>;
    findAll(): Promise<Plan[]>;
    findOne(id: number): Promise<Plan | null>;
    update(id: number, plan: Partial<Plan>): Promise<Plan | null>;
    remove(id: number): Promise<void>;
}
