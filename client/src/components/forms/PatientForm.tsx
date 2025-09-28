import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { usePatientsStore } from '@/store/patients';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

const patientSchema = z.object({
  firstName: z.string().min(2, 'Минимум 2 символа'),
  lastName: z.string().min(2, 'Минимум 2 символа'),
  dateOfBirth: z.date().refine(v => !!v, 'Выберите дату рождения'),
  phoneNumber: z
    .string()
    .refine(v => {
      const digits = v.replace(/\D/g, '');
      return /^([78]|\+?7)[0-9]{10}$/.test(digits.startsWith('8') ? '7' + digits.slice(1) : digits.startsWith('7') ? digits : digits.startsWith('+7') ? digits.slice(1) : digits);
    }, 'Введите номер в формате +7 (XXX) XXX-XX-XX'),
  email: z
    .string()
    .email('Введите корректный email')
    .optional()
    .or(z.literal('')),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface PatientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PatientForm({ open, onOpenChange }: PatientFormProps) {
  const { createPatient, loading } = usePatientsStore();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  const formatRuPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    let d = digits;
    if (d.startsWith('8')) d = '7' + d.slice(1);
    if (!d.startsWith('7')) d = '7' + d; // добавим 7, если пользователь начал с 9
    d = d.slice(0, 11);
    const parts = [
      d[0] ? '+7' : '',
      d.slice(1, 4),
      d.slice(4, 7),
      d.slice(7, 9),
      d.slice(9, 11),
    ];
    let out = '';
    if (parts[0]) out += parts[0] + ' ';
    if (parts[1]) out += `(${parts[1]}` + (parts[1].length === 3 ? ') ' : '');
    if (parts[2]) out += parts[2] + (parts[2].length === 3 ? '-' : '');
    if (parts[3]) out += parts[3] + (parts[3].length === 2 ? '-' : '');
    if (parts[4]) out += parts[4];
    return out.trim();
  };

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
    },
  });

  const onSubmit = async (data: PatientFormData) => {
    try {
      await createPatient({
        ...data,
        dateOfBirth: data.dateOfBirth.toISOString(),
        email: data.email || undefined,
      });

      form.reset();
      onOpenChange(false);
    } catch (error) {
      // Ошибка обрабатывается в store, но логируем для дебага
      console.error('PatientForm submit error:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Добавить пациента</DialogTitle>
          <DialogDescription>
            Заполните информацию о новом пациенте
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Имя</FormLabel>
                  <FormControl>
                    <Input placeholder="Введите имя" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Фамилия</FormLabel>
                  <FormControl>
                    <Input placeholder="Введите фамилию" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Дата рождения</FormLabel>
                  <Popover
                    open={isCalendarOpen}
                    onOpenChange={setIsCalendarOpen}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'dd.MM.yyyy')
                          ) : (
                            <span>Выберите дату</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        captionLayout="dropdown"
                        mode="single"
                        selected={field.value}
                        onSelect={date => {
                          field.onChange(date);
                          setIsCalendarOpen(false);
                        }}
                        disabled={date =>
                          date > new Date() || date < new Date('1900-01-01')
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Телефон</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="+7 (999) 123-45-67"
                      inputMode="numeric"
                      autoComplete="tel"
                      maxLength={20}
                      value={field.value}
                      onChange={e => field.onChange(formatRuPhone(e.target.value))}
                      onKeyDown={e => {
                        const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
                        if (allowed.includes(e.key)) return;
                        if (!/\d/.test(e.key)) e.preventDefault();
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (необязательно)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="example@email.com"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Отмена
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
