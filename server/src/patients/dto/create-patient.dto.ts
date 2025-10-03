import { IsString, IsDateString, IsEmail, IsOptional, IsNotEmpty, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePatientDto {
  @IsString({ message: 'Имя должно быть строкой' })
  @Transform(({ value }: { value: unknown }): string | undefined =>
    typeof value === 'string' ? value.trim() : undefined,
  )
  @Length(2, 100, { message: 'Имя должно содержать не менее 2 символов' })
  @IsNotEmpty({ message: 'Имя обязательно' })
  firstName: string;

  @IsString({ message: 'Фамилия должна быть строкой' })
  @Transform(({ value }: { value: unknown }): string | undefined =>
    typeof value === 'string' ? value.trim() : undefined,
  )
  @Length(2, 100, { message: 'Фамилия должна содержать не менее 2 символов' })
  @IsNotEmpty({ message: 'Фамилия обязательна' })
  lastName: string;

  @IsDateString({}, { message: 'Некорректный формат даты рождения' })
  dateOfBirth: string;

  @IsString({ message: 'Телефон должен быть строкой' })
  @Transform(({ value }: { value: unknown }): string | undefined =>
    typeof value === 'string' ? value.replace(/\D/g, '') : undefined,
  )
  @Length(10, 15, { message: 'Телефон должен содержать не менее 10 цифр' })
  @IsNotEmpty({ message: 'Телефон обязателен' })
  phoneNumber: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }): string | undefined =>
    typeof value === 'string' ? value.trim().toLowerCase() : undefined,
  )
  @IsEmail({}, { message: 'Некорректный email' })
  email?: string;
}
