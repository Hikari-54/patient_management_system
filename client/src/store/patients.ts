import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { patientsApi } from '@/lib/api';
import { Patient, CreatePatientDto, PaginatedResponse, PatientsQueryParams } from '@/types/api';

interface PatientsState {
  patients: Patient[];
  meta: PaginatedResponse<Patient>['meta'] | null;
  currentPatient: Patient | null;
  loading: boolean;
  error: string | null;
  lastQuery: PatientsQueryParams;
}

interface PatientsActions {
  fetchPatients: (params?: PatientsQueryParams) => Promise<void>;
  fetchPatient: (id: string) => Promise<void>;
  createPatient: (data: CreatePatientDto) => Promise<void>;
  updatePatient: (id: string, data: Partial<CreatePatientDto>) => Promise<void>;
  deletePatient: (id: string) => Promise<void>;
  setCurrentPatient: (patient: Patient | null) => void;
  clearError: () => void;
}

export const usePatientsStore = create<PatientsState & PatientsActions>()(
  immer((set, get) => ({
    // Состояние
    patients: [],
    meta: null,
    currentPatient: null,
    loading: false,
    error: null,
    lastQuery: { page: 1, limit: 10, search: undefined },

    // Действия
    fetchPatients: async params => {
      try {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        const previousQuery = get().lastQuery;
        const nextParams = { ...previousQuery, ...(params || {}) } as PatientsQueryParams;
        const response = await patientsApi.getAll(nextParams);

        set(state => {
          state.patients = response.data.data;
          state.meta = response.data.meta;
          state.lastQuery = nextParams;
          state.loading = false;
        });
      } catch (error) {
        set(state => {
          state.loading = false;
          state.error =
            error instanceof Error
              ? error.message
              : 'Ошибка загрузки пациентов';
        });
      }
    },

    fetchPatient: async id => {
      try {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        const response = await patientsApi.getById(id);

        set(state => {
          state.currentPatient = response.data;
          state.loading = false;
        });
      } catch (error) {
        set(state => {
          state.loading = false;
          state.error =
            error instanceof Error ? error.message : 'Ошибка загрузки пациента';
        });
      }
    },

    createPatient: async data => {
      try {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        const response = await patientsApi.create(data);

        set(state => {
          state.patients.push(response.data);
          state.loading = false;
        });
      } catch (error) {
        set(state => {
          state.loading = false;
          state.error =
            error instanceof Error ? error.message : 'Ошибка создания пациента';
        });
      }
    },

    updatePatient: async (id, data) => {
      try {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        const response = await patientsApi.update(id, data);

        set(state => {
          const index = state.patients.findIndex(p => p.id === id);
          if (index !== -1) {
            state.patients[index] = response.data;
          }
          if (state.currentPatient?.id === id) {
            state.currentPatient = response.data;
          }
          state.loading = false;
        });
      } catch (error) {
        set(state => {
          state.loading = false;
          state.error =
            error instanceof Error
              ? error.message
              : 'Ошибка обновления пациента';
        });
      }
    },

    deletePatient: async id => {
      try {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        await patientsApi.delete(id);

        set(state => {
          state.patients = state.patients.filter(p => p.id !== id);
          if (state.currentPatient?.id === id) {
            state.currentPatient = null;
          }
          state.loading = false;
        });
      } catch (error) {
        set(state => {
          state.loading = false;
          state.error =
            error instanceof Error ? error.message : 'Ошибка удаления пациента';
        });
      }
    },

    setCurrentPatient: patient => {
      set(state => {
        state.currentPatient = patient;
      });
    },

    clearError: () => {
      set(state => {
        state.error = null;
      });
    },
  }))
);
