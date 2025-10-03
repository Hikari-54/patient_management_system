import { PrismaClient, VisitStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Очистка таблиц (для локальной разработки)
    await prisma.visit.deleteMany();
    await prisma.patient.deleteMany();

    const patients = await prisma.$transaction([
      prisma.patient.create({
        data: {
          firstName: 'Иван',
          lastName: 'Иванов',
          dateOfBirth: new Date('1990-05-20'),
          phoneNumber: '+7 900 111-22-33',
          email: 'ivan@example.com',
        },
      }),
      prisma.patient.create({
        data: {
          firstName: 'Мария',
          lastName: 'Петрова',
          dateOfBirth: new Date('1985-10-12'),
          phoneNumber: '+7 900 444-55-66',
          email: 'maria@example.com',
        },
      }),
      prisma.patient.create({
        data: {
          firstName: 'Сергей',
          lastName: 'Сидоров',
          dateOfBirth: new Date('1978-03-02'),
          phoneNumber: '+7 900 777-88-99',
        },
      }),
      prisma.patient.create({
        data: {
          firstName: 'Татьяна',
          lastName: 'Козлова',
          dateOfBirth: new Date('1986-01-03'),
          phoneNumber: '+7-939-234-56-78',
          email: 'tatyana.kozlova@yandex.ru',
        },
      }),
      prisma.patient.create({
        data: {
          firstName: 'Нина',
          lastName: 'Козлова',
          dateOfBirth: new Date('1986-01-03'),
          phoneNumber: '+7-939-234-56-78',
          email: 'tatyana.kozlova@yandex.ru',
        },
      }),
      prisma.patient.create({
        data: {
          firstName: 'Александр',
          lastName: 'Смирнов',
          dateOfBirth: new Date('1992-07-15'),
          phoneNumber: '+7 999 123-45-67',
          email: 'alex.smirnov@gmail.com',
        },
      }),
      prisma.patient.create({
        data: {
          firstName: 'Елена',
          lastName: 'Васильева',
          dateOfBirth: new Date('1980-12-25'),
          phoneNumber: '+7 987 654-32-10',
          email: 'elena.vasilieva@mail.ru',
        },
      }),
    ]);

    await prisma.visit.createMany({
      data: [
        {
          patientId: patients[0].id,
          visitDate: new Date(),
          diagnosis: 'ОРВИ',
          treatment: 'Покой, обильное питьё',
          status: VisitStatus.SCHEDULED,
        },
        {
          patientId: patients[0].id,
          visitDate: new Date('2024-02-15'),
          diagnosis: 'Проф. осмотр',
          treatment: 'Без назначений',
          status: VisitStatus.COMPLETED,
        },
        {
          patientId: patients[1].id,
          visitDate: new Date('2024-03-10'),
          diagnosis: 'Боль в спине',
          treatment: 'ЛФК, НПВС',
          status: VisitStatus.CANCELLED,
        },
        {
          patientId: patients[3].id, // Татьяна Козлова
          visitDate: new Date('2025-09-10'),
          diagnosis: 'ОРВИ',
          treatment: 'Покой',
          status: VisitStatus.SCHEDULED,
        },
        {
          patientId: patients[3].id, // Татьяна Козлова
          visitDate: new Date('2025-09-02'),
          diagnosis: 'ОРВИ',
          treatment: 'Покой',
          status: VisitStatus.CANCELLED,
        },
        {
          patientId: patients[3].id, // Татьяна Козлова
          visitDate: new Date('2025-01-01'),
          diagnosis: 'ОРВИ',
          treatment: 'фывфыв',
          status: VisitStatus.SCHEDULED,
        },
        {
          patientId: patients[4].id, // Нина Козлова
          visitDate: new Date('2025-08-15'),
          diagnosis: 'Профилактический осмотр',
          treatment: 'Рекомендации по здоровому образу жизни',
          status: VisitStatus.COMPLETED,
        },
        {
          patientId: patients[5].id, // Александр Смирнов
          visitDate: new Date('2025-09-20'),
          diagnosis: 'Аллергическая реакция',
          treatment: 'Антигистаминные препараты',
          status: VisitStatus.SCHEDULED,
        },
        {
          patientId: patients[6].id, // Елена Васильева
          visitDate: new Date('2025-07-10'),
          diagnosis: 'Гипертония',
          treatment: 'Гипотензивные препараты, диета',
          status: VisitStatus.COMPLETED,
        },
      ],
    });

    console.log('Seed completed successfully');
  } catch (error) {
    console.error('Seed failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
