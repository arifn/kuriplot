import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { PlansService } from './plans.service';
import { Plan } from '../plan.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('plans')
@UseGuards(JwtAuthGuard)
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post()
  async create(@Body() plan: Partial<Plan>): Promise<Plan> {
    return this.plansService.create(plan);
  }

  @Get()
  async findAll(): Promise<Plan[]> {
    return this.plansService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Plan | null> {
    return this.plansService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() plan: Partial<Plan>): Promise<Plan | null> {
    return this.plansService.update(id, plan);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.plansService.remove(id);
  }
}