import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePatientsStore } from '@/store/patients';
import { useVisitsStore } from '@/store/visits';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2, ArrowLeft, Edit, Trash2, Minus } from 'lucide-react';
import { format } from 'date-fns';
import { VisitForm } from '@/components/forms/VisitForm';
import { VisitEditForm } from '@/components/forms/VisitEditForm';
import Badge from '@/components/ui/badge';
import { getStatusBadgeVariant } from '@/components/ui/status-utils';

function PatientDetailsPage() {
  const { id } = useParams();
  const { currentPatient, loading: patientsLoading, error: patientsError, fetchPatient, clearError } = usePatientsStore();
  const { visits, loading: visitsLoading, error: visitsError, fetchVisitsByPatient, deleteVisit, updateVisit, clearError: clearVisitsError } = useVisitsStore();
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchPatient(id);
      fetchVisitsByPatient(id);
    }
    return () => {
      clearError();
      clearVisitsError();
    };
  }, [id, fetchPatient, fetchVisitsByPatient, clearError, clearVisitsError]);

  if (patientsLoading && !currentPatient) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <Card>
          <CardContent className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin mr-2" /> Загрузка...
          </CardContent>
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
            <Link to="/patients">
              <ArrowLeft className="h-4 w-4 mr-2" /> Назад к списку
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4">
      {(patientsError || visitsError) && (
        <Alert variant="destructive">
          <AlertDescription>{patientsError || visitsError}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link to="/patients">
            <ArrowLeft className="h-4 w-4 mr-2" /> Назад
          </Link>
        </Button>
        <Button asChild className="w-full sm:w-auto">
          <Link to={`/patients/${currentPatient.id}/edit`}>Редактировать</Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="min-w-0 flex-1">
                <CardTitle className="text-xl sm:text-2xl break-words">
                  {currentPatient.firstName} {currentPatient.lastName}
                </CardTitle>
                <p className="text-muted-foreground mt-1 text-sm">
                  Пациент с {format(new Date(currentPatient.createdAt), 'dd.MM.yyyy')}
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                <Badge variant="outline" className="text-xs">
                  ID: {currentPatient.id}
                </Badge>
              </div>
            </div>
            <div className="sm:hidden">
              <Badge variant="outline" className="text-xs break-all">
                ID: {currentPatient.id}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div>
                  <div className="text-sm text-muted-foreground">Дата рождения</div>
                  <div className="font-medium">{format(new Date(currentPatient.dateOfBirth), 'dd.MM.yyyy')}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div>
                  <div className="text-sm text-muted-foreground">Телефон</div>
                  <div className="font-medium">{currentPatient.phoneNumber}</div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div>
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div className="font-medium">{currentPatient.email || '—'}</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Визиты
                <Badge variant="outline" className="text-xs">
                  {visits.length}
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                История визитов пациента
              </p>
            </div>
            <Button onClick={() => setIsVisitModalOpen(true)} className="gap-2">
              <span>+</span>
              Добавить визит
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          {visitsLoading ? (
            <div className="flex items-center justify-center py-8 px-4">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-muted-foreground">Загрузка визитов...</span>
            </div>
          ) : visits.length === 0 ? (
            <div className="text-center py-8 px-4">
              <div className="text-muted-foreground mb-4">Визитов пока нет</div>
              <Button variant="outline" onClick={() => setIsVisitModalOpen(true)}>
                Добавить первый визит
              </Button>
            </div>
          ) : (
            <div className="relative">
              <div className="overflow-x-auto px-4 sm:px-0 visits-scroll-container" style={{overflowX: 'scroll'}}>
                <ul className="space-y-2">
                {visits.map(v => (
                  <li key={v.id} className="flex items-center justify-between rounded p-3 hover:bg-muted/40 transition-colors group min-w-[520px]">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="font-medium flex items-center gap-2 flex-wrap">
                        {format(new Date(v.visitDate), 'dd.MM.yyyy')}
                        <Badge variant={getStatusBadgeVariant(v.status)}>
                          {v.status === 'SCHEDULED' ? 'Запланирован' : 
                           v.status === 'COMPLETED' ? 'Завершен' : 'Отменен'}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground truncate">{v.diagnosis}</div>
                      {v.treatment && (
                        <div className="text-xs text-muted-foreground truncate">Лечение: {v.treatment}</div>
                      )}
                      {v.notes && (
                        <div className="text-xs text-muted-foreground truncate">Заметки: {v.notes}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    {v.status === 'SCHEDULED' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          await updateVisit(v.id, { status: 'CANCELLED' });
                          fetchVisitsByPatient(currentPatient.id);
                        }}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        title="Отменить визит"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedVisitId(v.id);
                        setIsEditModalOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedVisitId(v.id);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
                </ul>
              </div>
              {/* Градиентные индикаторы скролла для мобильных */}
              <div className="sm:hidden absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-white to-transparent pointer-events-none z-10"></div>
              <div className="sm:hidden absolute top-0 left-0 w-8 h-full bg-gradient-to-r from-white to-transparent pointer-events-none z-10"></div>
            </div>
          )}
        </CardContent>
      </Card>

      <VisitForm
        open={isVisitModalOpen}
        onOpenChange={setIsVisitModalOpen}
        patientId={currentPatient.id}
        onCreated={() => fetchVisitsByPatient(currentPatient.id)}
      />

      {selectedVisitId && (
        <VisitEditForm
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          visitId={selectedVisitId}
          onUpdated={() => {
            fetchVisitsByPatient(currentPatient.id);
            setSelectedVisitId(null);
          }}
        />
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить визит?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Визит будет окончательно удален из системы.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (selectedVisitId) {
                  await deleteVisit(selectedVisitId);
                  fetchVisitsByPatient(currentPatient.id);
                  setSelectedVisitId(null);
                  setIsDeleteDialogOpen(false);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export { PatientDetailsPage };

