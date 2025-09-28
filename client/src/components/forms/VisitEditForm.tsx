import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useVisitsStore } from '@/store/visits';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const schema = z.object({
  visitDate: z.date().refine(v => !!v, 'Выберите дату визита'),
  diagnosis: z.string().min(2, 'Минимум 2 символа'),
  treatment: z.string().min(2, 'Минимум 2 символа'),
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED']),
  notes: z.string().optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

interface VisitEditFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visitId: string;
  onUpdated?: () => void;
}

export function VisitEditForm({ open, onOpenChange, visitId, onUpdated }: VisitEditFormProps) {
  const { updateVisit, loading, visits } = useVisitsStore();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      diagnosis: '',
      treatment: '',
      status: 'SCHEDULED',
      notes: '',
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
      return;
    }

    // Найти визит по ID и заполнить форму
    const visit = visits.find(v => v.id === visitId);
    if (visit) {
      form.reset({
        visitDate: new Date(visit.visitDate),
        diagnosis: visit.diagnosis,
        treatment: visit.treatment,
        status: visit.status,
        notes: visit.notes || '',
      });
    }
  }, [open, visitId, visits, form]);

  const onSubmit = async (data: FormData) => {
    await updateVisit(visitId, {
      visitDate: data.visitDate.toISOString(),
      diagnosis: data.diagnosis,
      treatment: data.treatment,
      status: data.status,
      notes: data.notes || undefined,
    } as unknown as {
      visitDate: string;
      diagnosis: string;
      treatment: string;
      status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
      notes?: string;
    });
    onOpenChange(false);
    onUpdated?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Редактировать визит</DialogTitle>
          <DialogDescription>Измените данные визита</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField name="visitDate" control={form.control} render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Дата визита</FormLabel>
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
                      onSelect={d => {
                        if (d) {
                          field.onChange(d);
                          setIsCalendarOpen(false);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )} />

            <FormField name="diagnosis" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Диагноз</FormLabel>
                <FormControl>
                  <Input placeholder="Например, ОРВИ" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField name="treatment" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Лечение</FormLabel>
                <FormControl>
                  <Input placeholder="Рекомендации" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField name="status" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Статус</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue placeholder="Выберите статус" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="SCHEDULED">Запланирован</SelectItem>
                    <SelectItem value="COMPLETED">Завершен</SelectItem>
                    <SelectItem value="CANCELLED">Отменен</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField name="notes" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Заметки</FormLabel>
                <FormControl>
                  <Input placeholder="Необязательно" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Отмена
              </Button>
              <Button type="submit" disabled={loading}>{loading ? 'Сохранение...' : 'Сохранить'}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default VisitEditForm;
