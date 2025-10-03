import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { FilterVisitsDto } from './dto/filter-visits.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class VisitsService {
  constructor(private prisma: PrismaService) {}

  async create(createVisitDto: CreateVisitDto) {
    return this.prisma.visit.create({
      data: {
        ...createVisitDto,
        visitDate: new Date(createVisitDto.visitDate),
      },
      include: {
        patient: true,
      },
    });
  }

  async findAll(filterDto?: FilterVisitsDto) {
    const where: Prisma.VisitWhereInput = {};

    if (filterDto?.status) {
      where.status = filterDto.status;
    }

    if (filterDto?.dateFrom || filterDto?.dateTo) {
      where.visitDate = {};
      if (filterDto.dateFrom) {
        where.visitDate.gte = new Date(filterDto.dateFrom);
      }
      if (filterDto.dateTo) {
        where.visitDate.lte = new Date(filterDto.dateTo);
      }
    }

    if (filterDto?.patientId) {
      where.patientId = filterDto.patientId;
    }

    return this.prisma.visit.findMany({
      where,
      include: {
        patient: true,
      },
      orderBy: { visitDate: 'desc' },
    });
  }

  async findOne(id: string) {
    const visit = await this.prisma.visit.findUnique({
      where: { id },
      include: {
        patient: true,
      },
    });

    if (!visit) {
      throw new NotFoundException(`Visit with ID ${id} not found`);
    }

    return visit;
  }

  async update(id: string, updateVisitDto: UpdateVisitDto) {
    await this.findOne(id);

    return this.prisma.visit.update({
      where: { id },
      data: {
        ...updateVisitDto,
        visitDate: updateVisitDto.visitDate ? new Date(updateVisitDto.visitDate) : undefined,
      },
      include: {
        patient: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.visit.delete({
      where: { id },
    });
  }
}
