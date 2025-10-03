import { IsString, IsDateString, IsOptional, IsEnum, IsNotEmpty, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export enum VisitStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class CreateVisitDto {
  @IsString({ message: 'ID пациента должен быть строкой' })
  @Transform(({ value }: { value: unknown }): string | undefined =>
    typeof value === 'string' ? value.trim() : undefined,
  )
  @Length(1, 100, { message: 'ID пациента обязателен' })
  @IsNotEmpty({ message: 'ID пациента обязателен' })
  patientId: string;

  @IsDateString({}, { message: 'Некорректный формат даты визита' })
  visitDate: string;

  @IsString({ message: 'Диагноз должен быть строкой' })
  @Transform(({ value }: { value: unknown }): string | undefined =>
    typeof value === 'string' ? value.trim() : undefined,
  )
  @Length(2, 1000, { message: 'Диагноз должен содержать от 2 до 1000 символов' })
  @IsNotEmpty({ message: 'Диагноз обязателен' })
  diagnosis: string;

  @IsString({ message: 'Лечение должно быть строкой' })
  @Transform(({ value }: { value: unknown }): string | undefined =>
    typeof value === 'string' ? value.trim() : undefined,
  )
  @Length(2, 2000, { message: 'Описание лечения должно содержать от 2 до 2000 символов' })
  @IsNotEmpty({ message: 'Описание лечения обязательно' })
  treatment: string;

  @IsOptional()
  @IsEnum(VisitStatus, { message: 'Некорректный статус визита' })
  status?: VisitStatus = VisitStatus.SCHEDULED;

  @IsOptional()
  @IsString({ message: 'Заметки должны быть строкой' })
  @Transform(({ value }: { value: unknown }): string | undefined =>
    typeof value === 'string' ? value.trim() : undefined,
  )
  notes?: string;
}
