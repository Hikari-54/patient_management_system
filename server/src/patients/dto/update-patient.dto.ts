import { IsString, IsDateString, IsEmail, IsOptional, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdatePatientDto {
  @IsOptional()
  @IsString({ message: 'Имя должно быть строкой' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : undefined))
  @Length(2, 100, { message: 'Имя должно содержать не менее 2 символов' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'Фамилия должна быть строкой' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : undefined))
  @Length(2, 100, { message: 'Фамилия должна содержать не менее 2 символов' })
  lastName?: string;

  @IsDateString({}, { message: 'Некорректный формат даты рождения' })
  @IsOptional()
  dateOfBirth?: string;

  @IsOptional()
  @IsString({ message: 'Телефон должен быть строкой' })
  @Transform(({ value }) => (typeof value === 'string' ? String(value).replace(/\D/g, '') : undefined))
  @Length(10, 15, { message: 'Телефон должен содержать не менее 10 цифр' })
  phoneNumber?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : undefined))
  @IsEmail({}, { message: 'Некорректный email' })
  email?: string;
}
