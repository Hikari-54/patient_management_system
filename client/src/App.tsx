import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PatientsPage } from '@/pages/PatientsPage';
import { PatientDetailsPage } from '@/pages/PatientDetailsPage';
import PatientEditPage from '@/pages/PatientEditPage';
import { usePatientsStore } from '@/store/patients';
import { useVisitsStore } from '@/store/visits';
import { Toast } from '@/components/ui/toast';

function App() {
  const { error: patientsError, clearError: clearPatientsError } =
    usePatientsStore();
  const { error: visitsError, clearError: clearVisitsError } = useVisitsStore();
  const errorMessage = patientsError || visitsError || null;
  const handleClose = () => {
    if (patientsError) clearPatientsError();
    if (visitsError) clearVisitsError();
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white">
        <header className="border-b border-gray-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Система управления пациентами
            </h1>
          </div>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<PatientsPage />} />
            <Route path="/patients" element={<PatientsPage />} />
            <Route path="/patients/:id" element={<PatientDetailsPage />} />
            <Route path="/patients/:id/edit" element={<PatientEditPage />} />
          </Routes>
          <Toast message={errorMessage} onClose={handleClose} />
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
