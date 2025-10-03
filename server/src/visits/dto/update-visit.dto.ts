import { IsString, IsDateString, IsOptional, IsEnum, Length } from 'class-validator';
import { Transform } from 'class-transformer';

enum VisitStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class UpdateVisitDto {
  @IsDateString({}, { message: 'Некорректный формат даты' })
  @IsOptional()
  visitDate?: string;

  @IsString({ message: 'Диагноз должен быть строкой' })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : undefined))
  @Length(2, 1000, { message: 'Диагноз должен содержать от 2 до 1000 символов' })
  @IsOptional()
  diagnosis?: string;

  @IsString({ message: 'Лечение должно быть строкой' })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : undefined))
  @Length(2, 2000, { message: 'Описание лечения должно содержать от 2 до 2000 символов' })
  @IsOptional()
  treatment?: string;

  @IsEnum(VisitStatus, { message: 'Некорректный статус визита' })
  @IsOptional()
  status?: VisitStatus;

  @IsString({ message: 'Заметки должны быть строкой' })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : undefined))
  @Length(0, 1000, { message: 'Заметки не должны превышать 1000 символов' })
  @IsOptional()
  notes?: string;
}
