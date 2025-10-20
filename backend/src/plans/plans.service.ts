import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from '../plan.entity';

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(Plan)
    private plansRepository: Repository<Plan>,
  ) {}

  async create(plan: Partial<Plan>): Promise<Plan> {
    const newPlan = this.plansRepository.create(plan);
    return this.plansRepository.save(newPlan);
  }

  async findAll(): Promise<Plan[]> {
    return this.plansRepository.find();
  }

  async findOne(id: number): Promise<Plan | null> {
    return this.plansRepository.findOne({ where: { id } });
  }

  async update(id: number, plan: Partial<Plan>): Promise<Plan | null> {
    await this.plansRepository.update(id, plan);
    return this.plansRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.plansRepository.delete(id);
  }
}