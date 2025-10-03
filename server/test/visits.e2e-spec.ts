import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../prisma/prisma.service';

class PrismaServiceMock {
  visit = {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
}

describe('Visits E2E (mocked Prisma)', () => {
  let app: INestApplication;
  let prismaMock: PrismaServiceMock;

  beforeEach(async () => {
    prismaMock = new PrismaServiceMock();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock as unknown as PrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  it('POST /visits creates, GET /visits/:id returns, filters by patientId', async () => {
    const created = {
      id: 'v1',
      patientId: 'p1',
      visitDate: new Date('2025-01-01').toISOString(),
      diagnosis: 'ОРВИ',
      treatment: 'Покой',
      status: 'SCHEDULED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    prismaMock.visit.create.mockResolvedValueOnce(created);
    prismaMock.visit.findUnique.mockResolvedValueOnce(created);
    prismaMock.visit.findMany.mockResolvedValueOnce([created]);

    const post = await request(app.getHttpServer() as unknown as Parameters<typeof request>[0])
      .post('/visits')
      .send({
        patientId: 'p1',
        visitDate: '2025-01-01',
        diagnosis: 'ОРВИ',
        treatment: 'Покой',
        status: 'SCHEDULED',
      })
      .expect(201);
    const postBody = post.body as unknown as { id: string };
    expect(typeof postBody.id).toBe('string');
    expect(postBody.id).toBe('v1');

    const get = await request(app.getHttpServer() as unknown as Parameters<typeof request>[0])
      .get('/visits/v1')
      .expect(200);
    const getBody = get.body as unknown as { id: string };
    expect(typeof getBody.id).toBe('string');
    expect(getBody.id).toBe('v1');

    const list = await request(app.getHttpServer() as unknown as Parameters<typeof request>[0])
      .get('/visits')
      .query({ patientId: 'p1' })
      .expect(200);
    const listBody = list.body as unknown as Array<{ id: string }>;
    expect(Array.isArray(listBody)).toBe(true);
    expect(listBody).toEqual([{ ...created }]);
  });
});
