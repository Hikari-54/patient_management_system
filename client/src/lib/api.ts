import axios from 'axios';
import {
  Patient,
  Visit,
  CreatePatientDto,
  PaginatedResponse,
  PatientsQueryParams,
} from '@/types/api';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const patientsApi = {
  getAll: (params?: PatientsQueryParams) =>
    api.get<PaginatedResponse<Patient>>('/patients', { params }),

  getById: (id: string) => api.get<Patient>(`/patients/${id}`),

  create: (data: CreatePatientDto) => api.post<Patient>('/patients', data),

  update: (id: string, data: Partial<CreatePatientDto>) =>
    api.put<Patient>(`/patients/${id}`, data),

  delete: (id: string) => api.delete(`/patients/${id}`),
};

export const visitsApi = {
  getAll: (params?: { status?: string; from?: string; to?: string }) =>
    api.get<Visit[]>('/visits', { params }),

  getById: (id: string) => api.get<Visit>(`/visits/${id}`),

  getByPatient: (patientId: string) => api.get<Visit[]>(`/patients/${patientId}/visits`),

  create: (data: Omit<Visit, 'id' | 'createdAt' | 'updatedAt'>) => api.post<Visit>('/visits', data),

  update: (id: string, data: Partial<Visit>) => api.put<Visit>(`/visits/${id}`, data),

  delete: (id: string) => api.delete(`/visits/${id}`),
};
