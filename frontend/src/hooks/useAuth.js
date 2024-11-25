import { create } from 'zustand';
import { api } from '@/utils/axios';

const useAuth = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  fetchUser: async () => {
    try {
      const response = await api().get('auth/user/');
      set({ user: response.data });
    } catch (error) {
      console.error('Failed to fetch user:', error);
      set({ user: null });
    }
  },
  logout: () => set({ user: null }),
}));

export { useAuth }; 