import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../prisma/prisma.service';

class PrismaServiceMock {
  patient = {
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  visit = {
    findMany: jest.fn(),
  };
}

describe('Patients E2E (mocked Prisma)', () => {
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

  it('GET /patients returns empty list with meta', async () => {
    prismaMock.patient.findMany.mockResolvedValueOnce([]);
    prismaMock.patient.count.mockResolvedValueOnce(0);

    const res = await request(app.getHttpServer() as unknown as Parameters<typeof request>[0])
      .get('/patients')
      .expect(200);
    const resBody = res.body as unknown as {
      data: unknown[];
      meta: { total: number; page: number; limit: number; totalPages: number };
    };
    expect(resBody).toEqual({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });
  });

  it('POST /patients creates patient, then GET /patients/:id returns it', async () => {
    const created = {
      id: 'p1',
      firstName: 'Иван',
      lastName: 'Иванов',
      dateOfBirth: new Date('1990-01-01').toISOString(),
      phoneNumber: '9001112233',
      email: 'ivan@example.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    prismaMock.patient.create.mockResolvedValueOnce(created);
    prismaMock.patient.findUnique.mockResolvedValueOnce(created);

    const post = await request(app.getHttpServer() as unknown as Parameters<typeof request>[0])
      .post('/patients')
      .send({
        firstName: 'Иван',
        lastName: 'Иванов',
        dateOfBirth: '1990-01-01',
        phoneNumber: '9001112233',
        email: 'ivan@example.com',
      })
      .expect(201);
    const postBody = post.body as unknown as { id: string };
    expect(typeof postBody.id).toBe('string');
    expect(postBody.id).toBe('p1');

    const get = await request(app.getHttpServer() as unknown as Parameters<typeof request>[0])
      .get('/patients/p1')
      .expect(200);
    const getBody = get.body as unknown as { id: string };
    expect(typeof getBody.id).toBe('string');
    expect(getBody.id).toBe('p1');
  });

  it('PUT /patients/:id updates, DELETE removes', async () => {
    prismaMock.patient.findUnique.mockResolvedValue({ id: 'p1' });
    prismaMock.patient.update.mockResolvedValue({ id: 'p1', firstName: 'Новый' });
    prismaMock.patient.delete.mockResolvedValue({ id: 'p1' });

    const put = await request(app.getHttpServer() as unknown as Parameters<typeof request>[0])
      .put('/patients/p1')
      .send({ firstName: 'Новый' })
      .expect(200);
    const putBody = put.body as unknown as { id: string; firstName: string };
    expect(putBody).toEqual({ id: 'p1', firstName: 'Новый' });

    await request(app.getHttpServer() as unknown as Parameters<typeof request>[0])
      .delete('/patients/p1')
      .expect(200);
  });
});
