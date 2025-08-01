/**
 * API Client for Slitherlink Backend
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

// Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any[];
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}

export interface User {
  id: number;
  email: string;
  username: string;
  display_name: string;
  created_at: string;
  last_login: string | null;
}

export interface UserPermissions {
  hasLeaderboardAccess: boolean;
  hasAdFreeAccess: boolean;
}

export interface LoginResponse {
  user: User;
  permissions: UserPermissions;
  token: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  display_name: string;
  turnstileToken?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  turnstileToken?: string;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('slitherlink_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('slitherlink_token', token);
      } else {
        localStorage.removeItem('slitherlink_token');
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || {
            code: 'HTTP_ERROR',
            message: `HTTP ${response.status}`,
          },
        };
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network request failed',
        },
      };
    }
  }

  // Auth endpoints
  async register(userData: RegisterRequest): Promise<ApiResponse<LoginResponse>> {
    // Use Next.js API route for registration
    return this.request<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    // Use Next.js API route for authentication
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getProfile(): Promise<ApiResponse<{ user: User; permissions: UserPermissions }>> {
    // For demo purposes, simulate profile retrieval
    if (process.env.NODE_ENV === 'development' && !BASE_URL.includes('localhost:8000')) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (this.token?.startsWith('admin_token_')) {
        const adminUser: User = {
          id: 1,
          email: 'admin@slitherlink.game',
          username: 'admin',
          display_name: 'Administrator',
          created_at: '2024-01-01T00:00:00.000Z',
          last_login: new Date().toISOString(),
        };

        const adminPermissions: UserPermissions = {
          hasLeaderboardAccess: true,
          hasAdFreeAccess: true,
        };

        return {
          success: true,
          data: {
            user: adminUser,
            permissions: adminPermissions,
          },
        };
      } else if (this.token?.startsWith('mock_token_')) {
        // Mock regular user
        // Extract info from mock token for registered users
        const tokenData = this.token.split('_');
        const mockUser: User = {
          id: parseInt(tokenData[2]) || 2,
          email: localStorage.getItem('mock_user_email') || 'user@example.com',
          username: localStorage.getItem('mock_user_username') || 'user',
          display_name: localStorage.getItem('mock_user_display_name') || 'User',
          created_at: localStorage.getItem('mock_user_created_at') || new Date().toISOString(),
          last_login: new Date().toISOString(),
        };

        const mockPermissions: UserPermissions = {
          hasLeaderboardAccess: false,
          hasAdFreeAccess: false,
        };

        return {
          success: true,
          data: {
            user: mockUser,
            permissions: mockPermissions,
          },
        };
      }
      
      // No valid token
      return {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired token',
        },
      };
    }

    return this.request<{ user: User; permissions: UserPermissions }>('/auth/profile');
  }

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return this.request<{ token: string }>('/auth/refresh-token', {
      method: 'POST',
    });
  }

  async purchaseLeaderboardAccess(): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/auth/purchase/leaderboard-access', {
      method: 'POST',
    });
  }

  // System endpoints
  async getApiInfo(): Promise<ApiResponse<any>> {
    return this.request('/info');
  }

  async generateTestPuzzle(): Promise<ApiResponse<any>> {
    return this.request('/test/generate');
  }

  // Puzzle endpoints
  async getPuzzle(difficulty: string, gridSize?: number): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({ difficulty });
    if (gridSize) {
      params.append('size', gridSize.toString());
    }
    return this.request(`/puzzle?${params.toString()}`);
  }

  async validateSolution(puzzleId: string, solution: number[][]): Promise<ApiResponse<any>> {
    return this.request('/puzzle/validate', {
      method: 'POST',
      body: JSON.stringify({ puzzleId, solution }),
    });
  }

  async getPuzzleStats(): Promise<ApiResponse<any>> {
    return this.request('/puzzle/stats');
  }

  // Health check
  async getHealth(): Promise<ApiResponse<any>> {
    return this.request('/health'.replace('/api/v1', '')); // Health is at root
  }
}

export const apiClient = new ApiClient();