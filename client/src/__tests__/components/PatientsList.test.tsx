import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PatientsList } from '@/components/patients/PatientsList';
import { usePatientsStore } from '@/store/patients';
import { vi } from 'vitest';

// Mock the store
vi.mock('@/store/patients');
const mockUsePatientsStore = vi.mocked(usePatientsStore);

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

const mockPatients = [
  {
    id: '1',
    firstName: 'Иван',
    lastName: 'Иванов',
    dateOfBirth: '1990-05-20',
    phoneNumber: '+7 900 111-22-33',
    email: 'ivan@example.com',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    firstName: 'Мария',
    lastName: 'Петрова',
    dateOfBirth: '1985-10-12',
    phoneNumber: '+7 900 444-55-66',
    email: 'maria@example.com',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const mockMeta = {
  total: 2,
  page: 1,
  limit: 10,
  totalPages: 1,
};

describe('PatientsList', () => {
  beforeEach(() => {
    mockUsePatientsStore.mockReturnValue({
      patients: mockPatients,
      loading: false,
      error: null,
      meta: mockMeta,
      lastQuery: { page: 1, limit: 10, search: '' },
      fetchPatients: vi.fn(),
      deletePatient: vi.fn(),
      clearError: vi.fn(),
    });
  });

  it('renders patients list correctly', () => {
    render(
      <BrowserRouter>
        <PatientsList />
      </BrowserRouter>
    );

    expect(screen.getByText('Пациенты')).toBeInTheDocument();
    expect(screen.getByText('Иван Иванов')).toBeInTheDocument();
    expect(screen.getByText('Мария Петрова')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUsePatientsStore.mockReturnValue({
      patients: [],
      loading: true,
      error: null,
      meta: null,
      lastQuery: { page: 1, limit: 10, search: '' },
      fetchPatients: vi.fn(),
      deletePatient: vi.fn(),
      clearError: vi.fn(),
    });

    render(
      <BrowserRouter>
        <PatientsList />
      </BrowserRouter>
    );

    expect(screen.getByText('Загрузка пациентов...')).toBeInTheDocument();
  });

  it('handles search input correctly', async () => {
    const mockFetchPatients = vi.fn();
    mockUsePatientsStore.mockReturnValue({
      patients: mockPatients,
      loading: false,
      error: null,
      meta: mockMeta,
      lastQuery: { page: 1, limit: 10, search: '' },
      fetchPatients: mockFetchPatients,
      deletePatient: vi.fn(),
      clearError: vi.fn(),
    });

    render(
      <BrowserRouter>
        <PatientsList />
      </BrowserRouter>
    );

    const searchInput = screen.getByPlaceholderText('Поиск');
    fireEvent.change(searchInput, { target: { value: 'Иван' } });

    await waitFor(() => {
      expect(mockFetchPatients).toHaveBeenCalledWith({ page: 1, search: 'Иван' });
    });
  });

  it('shows error message when there is an error', () => {
    mockUsePatientsStore.mockReturnValue({
      patients: [],
      loading: false,
      error: 'Ошибка загрузки пациентов',
      meta: null,
      lastQuery: { page: 1, limit: 10, search: '' },
      fetchPatients: vi.fn(),
      deletePatient: vi.fn(),
      clearError: vi.fn(),
    });

    render(
      <BrowserRouter>
        <PatientsList />
      </BrowserRouter>
    );

    expect(screen.getByText('Ошибка загрузки пациентов')).toBeInTheDocument();
  });
});
