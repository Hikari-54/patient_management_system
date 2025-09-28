import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { visitsApi } from '@/lib/api';
import { Visit } from '@/types/api';

interface VisitsState {
  visits: Visit[];
  loading: boolean;
  error: string | null;
}

interface VisitsActions {
  fetchVisits: (filters?: { status?: string; from?: string; to?: string }) => Promise<void>;
  fetchVisitsByPatient: (patientId: string) => Promise<void>;
  fetchVisit: (id: string) => Promise<void>;
  createVisit: (data: Omit<Visit, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateVisit: (id: string, data: Partial<Visit>) => Promise<void>;
  deleteVisit: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useVisitsStore = create<VisitsState & VisitsActions>()(
  immer(set => ({
    // Состояние
    visits: [],
    loading: false,
    error: null,

    // Действия
    fetchVisits: async (filters) => {
      try {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        const response = await visitsApi.getAll(filters);

        set(state => {
          state.visits = response.data;
          state.loading = false;
        });
      } catch (error) {
        set(state => {
          state.loading = false;
          state.error =
            error instanceof Error ? error.message : 'Ошибка загрузки визитов';
        });
      }
    },

    fetchVisitsByPatient: async patientId => {
      try {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        const response = await visitsApi.getByPatient(patientId);

        set(state => {
          state.visits = response.data;
          state.loading = false;
        });
      } catch (error) {
        set(state => {
          state.loading = false;
          state.error =
            error instanceof Error
              ? error.message
              : 'Ошибка загрузки визитов пациента';
        });
      }
    },

    fetchVisit: async id => {
      try {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        await visitsApi.getById(id);
        set(state => {
          state.loading = false;
        });
      } catch (error) {
        set(state => {
          state.loading = false;
          state.error = error instanceof Error ? error.message : 'Ошибка загрузки визита';
        });
      }
    },

    createVisit: async data => {
      try {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        const response = await visitsApi.create(data);
        set(state => {
          state.visits.push(response.data);
          state.loading = false;
        });
      } catch (error) {
        set(state => {
          state.loading = false;
          state.error = error instanceof Error ? error.message : 'Ошибка создания визита';
        });
      }
    },

    updateVisit: async (id, data) => {
      try {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        const response = await visitsApi.update(id, data);
        set(state => {
          const index = state.visits.findIndex(v => v.id === id);
          if (index !== -1) state.visits[index] = response.data;
          state.loading = false;
        });
      } catch (error) {
        set(state => {
          state.loading = false;
          state.error = error instanceof Error ? error.message : 'Ошибка обновления визита';
        });
      }
    },

    deleteVisit: async id => {
      try {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        await visitsApi.delete(id);
        set(state => {
          state.visits = state.visits.filter(v => v.id !== id);
          state.loading = false;
        });
      } catch (error) {
        set(state => {
          state.loading = false;
          state.error = error instanceof Error ? error.message : 'Ошибка удаления визита';
        });
      }
    },

    clearError: () => {
      set(state => {
        state.error = null;
      });
    },
  }))
);
