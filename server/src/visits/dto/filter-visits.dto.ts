import { IsOptional, IsEnum, IsDateString } from 'class-validator';

enum VisitStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class FilterVisitsDto {
  @IsOptional()
  @IsEnum(VisitStatus, { message: 'Некорректный статус визита' })
  status?: VisitStatus;

  @IsOptional()
  @IsDateString({}, { message: 'Некорректный формат даты' })
  dateFrom?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Некорректный формат даты' })
  dateTo?: string;

  @IsOptional()
  patientId?: string;
}
