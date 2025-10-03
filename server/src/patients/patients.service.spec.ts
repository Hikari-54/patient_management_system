import { Test, TestingModule } from '@nestjs/testing';
import { PatientsService } from './patients.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

const createPrismaMock = () => ({
  patient: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  visit: {
    findMany: jest.fn(),
  },
});

describe('PatientsService', () => {
  let service: PatientsService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [PatientsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<PatientsService>(PatientsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create: should create patient with normalized date', async () => {
    const dto: CreatePatientDto = {
      firstName: 'Иван',
      lastName: 'Иванов',
      dateOfBirth: '1990-01-01',
      phoneNumber: '9001112233',
      email: 'ivan@example.com',
    };
    prisma.patient.create.mockResolvedValue({
      id: 'p1',
      firstName: dto.firstName,
      lastName: dto.lastName,
      dateOfBirth: new Date('1990-01-01'),
      phoneNumber: dto.phoneNumber,
      email: dto.email,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const created = await service.create(dto);
    expect(prisma.patient.create).toHaveBeenCalled();
    expect(created.id).toBe('p1');
  });

  it('findAll: should return paginated list', async () => {
    prisma.patient.findMany.mockResolvedValue([]);
    prisma.patient.count.mockResolvedValue(0);

    const res = await service.findAll({ page: 1, limit: 10 });
    expect(prisma.patient.findMany).toHaveBeenCalled();
    expect(res).toEqual({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });
  });

  it('findOne: returns patient when exists', async () => {
    prisma.patient.findUnique.mockResolvedValue({ id: 'p1' });
    const res = await service.findOne('p1');
    expect(res).toEqual({ id: 'p1' });
  });

  it('update: updates existing patient', async () => {
    prisma.patient.findUnique.mockResolvedValue({ id: 'p1' });
    prisma.patient.update.mockResolvedValue({ id: 'p1', firstName: 'New' });
    const patch: UpdatePatientDto = { firstName: 'New' };
    const res = await service.update('p1', patch);
    expect(prisma.patient.update).toHaveBeenCalled();
    expect(res).toEqual({ id: 'p1', firstName: 'New' });
  });

  it('remove: deletes existing patient', async () => {
    prisma.patient.findUnique.mockResolvedValue({ id: 'p1' });
    prisma.patient.delete.mockResolvedValue({ id: 'p1' });
    const res = await service.remove('p1');
    expect(prisma.patient.delete).toHaveBeenCalled();
    expect(res).toEqual({ id: 'p1' });
  });

  it('getPatientVisits: returns visits list', async () => {
    prisma.patient.findUnique.mockResolvedValue({ id: 'p1' });
    prisma.visit.findMany.mockResolvedValue([{ id: 'v1' }]);
    const res = await service.getPatientVisits('p1');
    expect(res).toEqual([{ id: 'v1' }]);
  });
});
