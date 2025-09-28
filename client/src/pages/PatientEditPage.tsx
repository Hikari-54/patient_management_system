import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { CalendarIcon, ArrowLeft } from 'lucide-react';
import { usePatientsStore } from '@/store/patients';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

const schema = z.object({
  firstName: z.string().min(2, 'Минимум 2 символа'),
  lastName: z.string().min(2, 'Минимум 2 символа'),
  dateOfBirth: z.date().refine(v => !!v, 'Выберите дату рождения'),
  phoneNumber: z
    .string()
    .refine(v => {
      const digits = v.replace(/\D/g, '');
      return /^([78]|\+?7)[0-9]{10}$/.test(digits.startsWith('8') ? '7' + digits.slice(1) : digits.startsWith('7') ? digits : digits.startsWith('+7') ? digits.slice(1) : digits);
    }, 'Введите номер в формате +7 (XXX) XXX-XX-XX'),
  email: z.string().email('Введите корректный email').optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

function PatientEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentPatient, loading, error, fetchPatient, updatePatient, clearError } = usePatientsStore();
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

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
    },
  });

  useEffect(() => {
    if (id) fetchPatient(id);
  }, [id, fetchPatient]);

  useEffect(() => {
    if (currentPatient) {
      form.reset({
        firstName: currentPatient.firstName,
        lastName: currentPatient.lastName,
        phoneNumber: currentPatient.phoneNumber,
        email: currentPatient.email || '',
        dateOfBirth: new Date(currentPatient.dateOfBirth),
      });
    }
  }, [currentPatient, form]);

  useEffect(() => () => clearError(), [clearError]);

  const onSubmit = async (data: FormData) => {
    if (!id) return;
    await updatePatient(id, {
      ...data,
      dateOfBirth: data.dateOfBirth.toISOString(),
      email: data.email || undefined,
    });
    navigate(`/patients/${id}`);
  };

  if (loading && !currentPatient) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <Card>
          <CardContent className="py-8">Загрузка...</CardContent>
        </Card>
      </div>
    );
  }

  if (!currentPatient) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <Alert variant="destructive">
          <AlertDescription>Пациент не найден</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild variant="outline">
            <Link to="/patients"><ArrowLeft className="h-4 w-4 mr-2"/>Назад</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <Card>
        <CardHeader>
          <CardTitle>Редактирование пациента</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField name="firstName" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Имя</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="lastName" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Фамилия</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="dateOfBirth" control={form.control} render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Дата рождения</FormLabel>
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                          {field.value ? format(field.value, 'dd.MM.yyyy') : <span>Выберите дату</span>}
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
                        disabled={d => d > new Date() || d < new Date('1900-01-01')}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="phoneNumber" control={form.control} render={({ field }) => (
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
              )} />
              <FormField name="email" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" asChild>
                  <Link to={`/patients/${currentPatient.id}`}>
                    Отмена
                  </Link>
                </Button>
                <Button type="submit" disabled={loading}>{loading ? 'Сохранение...' : 'Сохранить'}</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default PatientEditPage;

