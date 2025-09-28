import { useCallback, useEffect, useMemo, useState, memo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatientsStore } from '@/store/patients';
import { useDebounce } from '@/hooks/use-debounce';
import { Patient } from '@/types/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Eye, Edit, Trash2, Loader2, Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { format } from 'date-fns';
import { PatientForm } from '@/components/forms/PatientForm';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Мемоизированный компонент строки таблицы
const PatientRow = memo(({ 
  patient, 
  onDelete, 
  onNavigate, 
  formatDate, 
  loading,
  searchQuery
}: {
  patient: Patient;
  onDelete: (id: string, name: string) => void;
  onNavigate: (path: string) => void;
  formatDate: (date: string) => string;
  loading: boolean;
  searchQuery: string;
}) => (
  <TableRow 
    key={patient.id} 
    className="hover:bg-muted/40 cursor-pointer" 
    onClick={() => onNavigate(`/patients/${patient.id}`)}
  >
    <TableCell className="font-medium">
      <span className="underline-offset-2 hover:underline">
        <HighlightText text={`${patient.firstName} ${patient.lastName}`} search={searchQuery} />
      </span>
    </TableCell>
    <TableCell>
      <HighlightText text={formatDate(patient.dateOfBirth)} search={searchQuery} />
    </TableCell>
    <TableCell>
      <HighlightText text={patient.phoneNumber} search={searchQuery} />
    </TableCell>
    <TableCell>
      {patient.email ? (
        <HighlightText text={patient.email} search={searchQuery} />
      ) : (
        '—'
      )}
    </TableCell>
    <TableCell onClick={e => e.stopPropagation()}>
      <div className="flex items-center gap-2">
        <Button title="Открыть" variant="outline" size="sm" onClick={() => onNavigate(`/patients/${patient.id}`)}>
          <Eye className="h-3 w-3" />
        </Button>
        <Button title="Редактировать" variant="outline" size="sm" onClick={() => onNavigate(`/patients/${patient.id}/edit`)}>
          <Edit className="h-3 w-3" />
        </Button>
        <Button
          title="Удалить"
          variant="outline"
          size="sm"
          onClick={() => onDelete(patient.id, `${patient.firstName} ${patient.lastName}`)}
          disabled={loading}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </TableCell>
  </TableRow>
));

PatientRow.displayName = 'PatientRow';

// Компонент для подсветки найденного текста
const HighlightText = ({ text, search }: { text: string; search: string }) => {
  if (!search.trim()) return <span>{text}</span>;
  
  const regex = new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <span>
      {parts.map((part, index) => 
        regex.test(part) ? (
          <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
};

export function PatientsList() {
  const { patients, loading, error, fetchPatients, deletePatient, clearError, meta, lastQuery } =
    usePatientsStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<{ id: string; name: string } | null>(null);
  const [search, setSearch] = useState<string>(lastQuery.search || '');
  const [isTyping, setIsTyping] = useState(false);
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Дебаунс поискового запроса на 500мс
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    fetchPatients({ page: 1, limit: lastQuery.limit, search: lastQuery.search });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Автоматический поиск при изменении дебаунсированного значения
  useEffect(() => {
    if (debouncedSearch !== lastQuery.search) {
      // Сохраняем фокус на поле поиска
      const activeElement = document.activeElement;
      const isSearchInputFocused = searchInputRef.current === activeElement;
      
      fetchPatients({ page: 1, search: debouncedSearch });
      
      // Восстанавливаем фокус после загрузки
      if (isSearchInputFocused && searchInputRef.current) {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 100);
      }
    }
  }, [debouncedSearch, fetchPatients, lastQuery.search]);

  // Восстанавливаем фокус после завершения загрузки
  useEffect(() => {
    if (!loading && searchInputRef.current && search.trim() && isTyping) {
      // Небольшая задержка для завершения рендера
      setTimeout(() => {
        searchInputRef.current?.focus();
        setIsTyping(false);
      }, 50);
    }
  }, [loading, search, isTyping]);

  const canPrev = useMemo(() => (meta ? meta.page > 1 : false), [meta]);
  const canNext = useMemo(() => (meta ? meta.page < meta.totalPages : false), [meta]);

  // Используем только серверную фильтрацию для избежания лишних перерендеров
  const filteredPatients = patients;

  const handleDeleteRequest = useCallback((id: string, name: string) => {
    setToDelete({ id, name });
    setConfirmOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (toDelete) {
      await deletePatient(toDelete.id);
    }
    setConfirmOpen(false);
    setToDelete(null);
  }, [toDelete, deletePatient]);

  const formatDate = useCallback((dateString: string) => {
    try {
      return format(new Date(dateString), 'dd.MM.yyyy');
    } catch {
      return dateString;
    }
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setIsTyping(true);
  }, []);

  const handleManualSearch = useCallback(() => {
    fetchPatients({ page: 1, search });
  }, [fetchPatients, search]);

  const handleClearSearch = useCallback(() => {
    setSearch('');
    fetchPatients({ page: 1, search: '' });
  }, [fetchPatients]);

  const handlePageChange = useCallback((page: number) => {
    fetchPatients({ page });
  }, [fetchPatients]);

  if (loading && patients.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Загрузка пациентов...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-xl sm:text-2xl font-bold">Пациенты</h1>
          <Button onClick={() => setIsAddModalOpen(true)} className="sm:hidden">
            <Plus className="h-4 w-4 mr-2" />
            Добавить пациента
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative w-full sm:w-[320px]">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="Поиск"
              className="pl-8 pr-8"
              value={search}
              onChange={handleSearchChange}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleManualSearch();
                }
              }}
            />
            {search.trim() && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
                onClick={handleClearSearch}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} className="hidden sm:flex">
            <Plus className="h-4 w-4 mr-2" />
            Добавить пациента
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            {error}
            <Button variant="outline" size="sm" onClick={clearError}>
              Закрыть
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Список пациентов {meta ? `(стр. ${meta.page}/${meta.totalPages}, всего ${meta.total})` : `(${patients.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          {filteredPatients.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground px-4">
              {search.trim() ? 'Пациенты не найдены по запросу' : 'Пациенты не найдены'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="w-full min-w-[640px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/4">Имя</TableHead>
                  <TableHead className="w-1/6">Дата рождения</TableHead>
                  <TableHead className="w-1/6">Телефон</TableHead>
                  <TableHead className="w-1/4">Email</TableHead>
                  <TableHead className="w-1/6">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map(patient => (
                  <PatientRow
                    key={patient.id}
                    patient={patient}
                    onDelete={handleDeleteRequest}
                    onNavigate={navigate}
                    formatDate={formatDate}
                    loading={loading}
                    searchQuery={search}
                  />
                ))}
              </TableBody>
            </Table>
            </div>
          )}
          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 px-4 sm:px-0">
              <div className="text-sm text-muted-foreground text-center sm:text-left">
                Показаны {(meta.page - 1) * meta.limit + 1}
                –{Math.min(meta.page * meta.limit, meta.total)} из {meta.total}
              </div>
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canPrev || loading}
                  onClick={() => handlePageChange((meta.page || 1) - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm">{meta.page}</div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canNext || loading}
                  onClick={() => handlePageChange((meta.page || 1) + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading overlay для действий */}
      {loading && patients.length > 0 && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <Card className="p-4">
            <div className="flex items-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Обработка запроса...
            </div>
          </Card>
        </div>
      )}

      <PatientForm open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Удалить пациента</DialogTitle>
            <DialogDescription>
              {toDelete ? `Вы уверены, что хотите удалить "${toDelete.name}"? Это действие необратимо.` : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={loading}>Отмена</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={loading}>Удалить</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
