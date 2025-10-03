import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { Patient } from '@prisma/client';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  async create(createPatientDto: CreatePatientDto) {
    return this.prisma.patient.create({
      data: {
        ...createPatientDto,
        dateOfBirth: new Date(createPatientDto.dateOfBirth),
      },
    });
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResponse<Patient>> {
    const { page = 1, limit = 10, search } = paginationDto;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' as const } },
            { lastName: { contains: search, mode: 'insensitive' as const } },
            { phoneNumber: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    let data: Patient[];
    let total: number;

    // Если есть поиск, получаем все записи и фильтруем комплексно
    if (search) {
      const allData = await this.prisma.patient.findMany({
        include: { visits: true },
        orderBy: { createdAt: 'desc' },
      });

      // Фильтруем по всем полям (текстовые + дата)
      const filteredData = allData.filter((patient) => {
        const searchLower = search.toLowerCase();

        // Поиск по текстовым полям
        const textMatch =
          patient.firstName.toLowerCase().includes(searchLower) ||
          patient.lastName.toLowerCase().includes(searchLower) ||
          patient.phoneNumber.toLowerCase().includes(searchLower) ||
          (patient.email && patient.email.toLowerCase().includes(searchLower));

        // Поиск по дате рождения (если запрос похож на дату)
        const dateMatch = this.isDateLikeSearch(search) && this.matchesDateSearch(patient.dateOfBirth, search);

        return textMatch || dateMatch;
      });

      // Применяем пагинацию
      total = filteredData.length;
      data = filteredData.slice(skip, skip + limit);
    } else {
      // Если поиска нет, используем обычную пагинацию
      [data, total] = await Promise.all([
        this.prisma.patient.findMany({
          where,
          include: { visits: true },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.patient.count({ where }),
      ]);
    }

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
      include: { visits: true },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    return patient;
  }

  async update(id: string, updatePatientDto: UpdatePatientDto) {
    await this.findOne(id);

    return this.prisma.patient.update({
      where: { id },
      data: {
        ...updatePatientDto,
        dateOfBirth: updatePatientDto.dateOfBirth ? new Date(updatePatientDto.dateOfBirth) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.patient.delete({
      where: { id },
    });
  }

  async getPatientVisits(patientId: string) {
    await this.findOne(patientId);

    return this.prisma.visit.findMany({
      where: { patientId },
      include: { patient: true },
      orderBy: { visitDate: 'desc' },
    });
  }

  // Проверяет, похож ли поисковый запрос на дату
  private isDateLikeSearch(search: string): boolean {
    const searchTrim = search.trim();

    // Проверяем различные паттерны дат
    const datePatterns = [
      /^\d{1,2}$/, // Только день или месяц: 03, 1, 25
      /^\d{4}$/, // Только год: 1986, 2025
      /^\d{1,2}\.\d{1,2}$/, // День и месяц: 03.01, 25.12
      /^\d{1,2}\.\d{4}$/, // Месяц и год: 01.1986, 12.2025
      /^\d{1,2}\.\d{1,2}\.\d{4}$/, // Полная дата: 03.01.1986
    ];

    return datePatterns.some((pattern) => pattern.test(searchTrim));
  }

  // Проверяет, соответствует ли дата рождения поисковому запросу
  private matchesDateSearch(dateOfBirth: Date, search: string): boolean {
    try {
      const searchTrim = search.trim();

      const day = dateOfBirth.getDate().toString().padStart(2, '0');
      const month = (dateOfBirth.getMonth() + 1).toString().padStart(2, '0');
      const year = dateOfBirth.getFullYear().toString();

      // Полная дата DD.MM.YYYY
      if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(searchTrim)) {
        const fullDate = `${day}.${month}.${year}`;
        return fullDate === searchTrim;
      }

      // День и месяц DD.MM
      if (/^\d{1,2}\.\d{1,2}$/.test(searchTrim)) {
        const dayMonth = `${day}.${month}`;
        return dayMonth === searchTrim;
      }

      // Месяц и год MM.YYYY
      if (/^\d{1,2}\.\d{4}$/.test(searchTrim)) {
        const monthYear = `${month}.${year}`;
        return monthYear === searchTrim;
      }

      // Только год YYYY
      if (/^\d{4}$/.test(searchTrim)) {
        return year === searchTrim;
      }

      // Только день или месяц (одна или две цифры)
      if (/^\d{1,2}$/.test(searchTrim)) {
        const searchPadded = searchTrim.padStart(2, '0');
        return day === searchPadded || month === searchPadded;
      }

      return false;
    } catch {
      return false;
    }
  }

  // Форматирует дату в строку DD.MM.YYYY для поиска
  private formatDateForSearch(date: Date): string {
    try {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear().toString();
      return `${day}.${month}.${year}`;
    } catch {
      return '';
    }
  }
}
