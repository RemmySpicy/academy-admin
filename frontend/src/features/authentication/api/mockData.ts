import { User, Program } from '../types';

export const mockPrograms: Program[] = [
  {
    id: '1',
    name: 'Swimming Program',
    code: 'SWIM'
  },
  {
    id: '2',
    name: 'Basketball Program',
    code: 'BBALL'
  },
  {
    id: '3',
    name: 'Football Program',
    code: 'FOOT'
  }
];

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@academy.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'super_admin',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-08T00:00:00Z',
    programs: mockPrograms
  },
  {
    id: '2',
    email: 'swim.admin@academy.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'program_admin',
    isActive: true,
    createdAt: '2025-01-02T00:00:00Z',
    updatedAt: '2025-01-08T00:00:00Z',
    programs: [mockPrograms[0]] // Swimming only
  },
  {
    id: '3',
    email: 'sports.admin@academy.com',
    firstName: 'Mike',
    lastName: 'Wilson',
    role: 'program_admin',
    isActive: true,
    createdAt: '2025-01-03T00:00:00Z',
    updatedAt: '2025-01-08T00:00:00Z',
    programs: [mockPrograms[1], mockPrograms[2]] // Basketball and Football
  },
  {
    id: '4',
    email: 'jane.smith@academy.com',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'program_admin',
    isActive: false,
    createdAt: '2025-01-04T00:00:00Z',
    updatedAt: '2025-01-08T00:00:00Z',
    programs: [mockPrograms[0]]
  },
  {
    id: '5',
    email: 'coach.martinez@academy.com',
    firstName: 'Carlos',
    lastName: 'Martinez',
    role: 'program_admin',
    isActive: true,
    createdAt: '2025-01-05T00:00:00Z',
    updatedAt: '2025-01-08T00:00:00Z',
    programs: [mockPrograms[1]]
  }
];

// Mock credentials for testing
export const mockCredentials = {
  'admin@academy.com': 'admin123',
  'swim.admin@academy.com': 'swim123',
  'sports.admin@academy.com': 'sports123',
  'jane.smith@academy.com': 'jane123',
  'coach.martinez@academy.com': 'coach123'
};