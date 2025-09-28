export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phoneNumber: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
  visits?: Visit[];
}

export interface Visit {
  id: string;
  patientId: string;
  visitDate: string;
  diagnosis: string;
  treatment: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  patient?: Patient;
}

export interface CreatePatientDto {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phoneNumber: string;
  email?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PatientsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}
