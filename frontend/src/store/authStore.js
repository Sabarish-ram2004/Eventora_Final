import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      login: async (credentials) => {
        const res = await api.post('/auth/login', credentials);
        const data = res.data.data;
        set({
          user: {
            id: data.userId,
            username: data.username,
            email: data.email,
            role: data.role,
            fullName: data.fullName,
            profileImage: data.profileImage,
            emailVerified: data.emailVerified,
            vendorId: data.vendorId,
          },
          token: data.accessToken,
          refreshToken: data.refreshToken,
          isAuthenticated: true,
        });
        api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
        return data;
      },

      register: async (userData) => {
        const res = await api.post('/auth/register', userData);
        return res.data;
      },

      logout: () => {
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
        delete api.defaults.headers.common['Authorization'];
      },

      updateUser: (updates) => {
        set((state) => ({ user: { ...state.user, ...updates } }));
      },

      setToken: (token) => {
        set({ token });
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      },
    }),
    {
      name: 'eventora-auth',
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
        }
      },
    }
  )
);

export default useAuthStore;
