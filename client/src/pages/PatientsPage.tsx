import { PatientsList } from '@/components/patients/PatientsList';
import { useEffect } from 'react';
import { usePatientsStore } from '@/store/patients';

export function PatientsPage() {
  const { clearError } = usePatientsStore();
  useEffect(() => {
    return () => clearError();
  }, [clearError]);
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <PatientsList />
    </div>
  );
}
