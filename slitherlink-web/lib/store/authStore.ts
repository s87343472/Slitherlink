import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient, User, UserPermissions, LoginRequest, RegisterRequest } from '@/lib/services/apiClient';

interface AuthState {
  // State
  user: User | null;
  permissions: UserPermissions | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (userData: RegisterRequest) => Promise<boolean>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  purchaseLeaderboardAccess: () => Promise<boolean>;
  clearError: () => void;

  // Initialize from stored token
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      permissions: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login action
      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });

        try {
          const response = await apiClient.login(credentials);

          if (response.success && response.data) {
            const { user, permissions, token } = response.data;
            apiClient.setToken(token);
            
            set({
              user,
              permissions,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            return true;
          } else {
            set({
              isLoading: false,
              error: response.error?.message || 'Login failed',
            });
            return false;
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Login failed',
          });
          return false;
        }
      },

      // Register action
      register: async (userData: RegisterRequest) => {
        set({ isLoading: true, error: null });

        try {
          const response = await apiClient.register(userData);

          if (response.success && response.data) {
            const { user, permissions, token } = response.data;
            apiClient.setToken(token);
            
            set({
              user,
              permissions,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            return true;
          } else {
            set({
              isLoading: false,
              error: response.error?.message || 'Registration failed',
            });
            return false;
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Registration failed',
          });
          return false;
        }
      },

      // Logout action
      logout: () => {
        apiClient.setToken(null);
        set({
          user: null,
          permissions: null,
          isAuthenticated: false,
          error: null,
        });
      },

      // Refresh user profile
      refreshProfile: async () => {
        if (!apiClient.getToken()) return;

        set({ isLoading: true });

        try {
          const response = await apiClient.getProfile();

          if (response.success && response.data) {
            const { user, permissions } = response.data;
            set({
              user,
              permissions,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            // Token might be invalid, logout
            get().logout();
            set({ isLoading: false });
          }
        } catch (error) {
          get().logout();
          set({ isLoading: false });
        }
      },

      // Purchase leaderboard access
      purchaseLeaderboardAccess: async () => {
        set({ isLoading: true, error: null });

        try {
          const response = await apiClient.purchaseLeaderboardAccess();

          if (response.success) {
            // Refresh profile to get updated permissions
            await get().refreshProfile();
            return true;
          } else {
            set({
              isLoading: false,
              error: response.error?.message || 'Purchase failed',
            });
            return false;
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Purchase failed',
          });
          return false;
        }
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Initialize from stored token
      initialize: async () => {
        const token = apiClient.getToken();
        if (token) {
          await get().refreshProfile();
        }
      },
    }),
    {
      name: 'slitherlink-auth',
      partialize: (state) => ({
        // Only persist essential data, not the full user object
        // The token is handled by apiClient
      }),
    }
  )
);