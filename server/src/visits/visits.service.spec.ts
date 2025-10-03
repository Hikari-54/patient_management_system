import { Test, TestingModule } from '@nestjs/testing';
import { VisitsService } from './visits.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVisitDto, VisitStatus } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { FilterVisitsDto } from './dto/filter-visits.dto';

const createPrismaMock = () => ({
  visit: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
});

describe('VisitsService', () => {
  let service: VisitsService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [VisitsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<VisitsService>(VisitsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create: should create visit with normalized date', async () => {
    const dto: CreateVisitDto = {
      patientId: 'p1',
      visitDate: '2025-01-01',
      diagnosis: 'ОРВИ',
      treatment: 'Покой',
      status: VisitStatus.SCHEDULED,
    };
    prisma.visit.create.mockResolvedValue({
      id: 'v1',
      patientId: 'p1',
      visitDate: new Date('2025-01-01'),
      diagnosis: 'ОРВИ',
      treatment: 'Покой',
      status: 'SCHEDULED',
    });
    const created = await service.create(dto);
    expect(prisma.visit.create).toHaveBeenCalled();
    expect(created.id).toBe('v1');
  });

  it('findAll: filters by patientId', async () => {
    prisma.visit.findMany.mockResolvedValue([]);
    const res = await service.findAll({ patientId: 'p1' } as FilterVisitsDto);
    expect(prisma.visit.findMany).toHaveBeenCalled();
    expect(res).toEqual([]);
  });

  it('findOne: returns visit when exists', async () => {
    prisma.visit.findUnique.mockResolvedValue({ id: 'v1' });
    const res = await service.findOne('v1');
    expect(res).toEqual({ id: 'v1' });
  });

  it('update: updates existing visit', async () => {
    prisma.visit.findUnique.mockResolvedValue({ id: 'v1' });
    prisma.visit.update.mockResolvedValue({ id: 'v1', diagnosis: 'NEW' });
    const patch: UpdateVisitDto = { diagnosis: 'NEW' };
    const res = await service.update('v1', patch);
    expect(prisma.visit.update).toHaveBeenCalled();
    expect(res).toEqual({ id: 'v1', diagnosis: 'NEW' });
  });

  it('remove: deletes existing visit', async () => {
    prisma.visit.findUnique.mockResolvedValue({ id: 'v1' });
    prisma.visit.delete.mockResolvedValue({ id: 'v1' });
    const res = await service.remove('v1');
    expect(prisma.visit.delete).toHaveBeenCalled();
    expect(res).toEqual({ id: 'v1' });
  });
});
