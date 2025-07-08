import { LoginCredentials, AuthResponse, User, CreateUserData, UpdateUserData } from '../types';
import { mockUsers, mockCredentials, mockPrograms } from './mockData';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock JWT token generator
const generateMockToken = (user: User): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: user.id,
    email: user.email,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + (8 * 60 * 60) // 8 hours
  }));
  const signature = btoa('mock-signature');
  return `${header}.${payload}.${signature}`;
};

// Token storage
const TOKEN_KEY = 'academy_auth_token';
const USER_KEY = 'academy_user';

export const authService = {
  // Login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await delay(1000); // Simulate network delay

    const { email, password } = credentials;
    
    // Check credentials
    if (!mockCredentials[email as keyof typeof mockCredentials] || 
        mockCredentials[email as keyof typeof mockCredentials] !== password) {
      throw new Error('Invalid email or password');
    }

    // Find user
    const user = mockUsers.find(u => u.email === email);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Generate token
    const accessToken = generateMockToken(user);
    
    // Store in localStorage
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    return {
      accessToken,
      tokenType: 'bearer',
      expiresIn: 28800, // 8 hours
      user
    };
  },

  // Logout
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // Get current user from storage
  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem(USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  // Check if authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = this.getCurrentUser();
    
    if (!token || !user) {
      return false;
    }

    // Simple token expiry check (in real app, would decode JWT)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp * 1000 < Date.now();
      
      if (isExpired) {
        this.logout();
        return false;
      }
      
      return true;
    } catch {
      this.logout();
      return false;
    }
  },

  // Get all users (for user management)
  async getUsers(): Promise<User[]> {
    await delay(500);
    return [...mockUsers];
  },

  // Create user
  async createUser(userData: CreateUserData): Promise<User> {
    await delay(800);

    // Check if email already exists
    if (mockUsers.some(u => u.email === userData.email)) {
      throw new Error('Email already exists');
    }

    // Create new user
    const newUser: User = {
      id: (mockUsers.length + 1).toString(),
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      programs: userData.programIds?.map(id => 
        mockPrograms.find(p => p.id === id)!
      ).filter(Boolean) || []
    };

    // Add to mock data
    mockUsers.push(newUser);

    return newUser;
  },

  // Update user
  async updateUser(id: string, userData: UpdateUserData): Promise<User> {
    await delay(600);

    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    // Update user
    const updatedUser: User = {
      ...mockUsers[userIndex],
      ...userData,
      updatedAt: new Date().toISOString()
    };

    mockUsers[userIndex] = updatedUser;

    // Update stored user if it's the current user
    const currentUser = this.getCurrentUser();
    if (currentUser?.id === id) {
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    }

    return updatedUser;
  },

  // Delete user
  async deleteUser(id: string): Promise<void> {
    await delay(500);

    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    // Don't allow deleting the super admin
    if (mockUsers[userIndex].role === 'super_admin') {
      throw new Error('Cannot delete super admin user');
    }

    mockUsers.splice(userIndex, 1);
  },

  // Get user by ID
  async getUser(id: string): Promise<User> {
    await delay(300);

    const user = mockUsers.find(u => u.id === id);
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  },

  // Assign programs to user
  async assignPrograms(userId: string, programIds: string[]): Promise<User> {
    await delay(500);

    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    const programs = programIds.map(id => 
      mockPrograms.find(p => p.id === id)!
    ).filter(Boolean);

    const updatedUser: User = {
      ...mockUsers[userIndex],
      programs,
      updatedAt: new Date().toISOString()
    };

    mockUsers[userIndex] = updatedUser;

    return updatedUser;
  },

  // Get available programs
  async getPrograms() {
    await delay(200);
    return [...mockPrograms];
  }
};