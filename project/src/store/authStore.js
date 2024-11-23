import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Predefined admin user
const adminUser = {
  username: 'admin',
  password: 'admin123',
  phone: '1234567890',
  isAdmin: true
};

// Regular user
const regularUser = {
  username: 'user',
  password: 'user123',
  phone: '0987654321',
  isAdmin: false
};

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      setUser: (credentials) => {
        // Check if credentials match admin
        if (
          credentials.username === adminUser.username &&
          credentials.password === adminUser.password &&
          credentials.phone === adminUser.phone
        ) {
          set({ user: adminUser });
          return true;
        }
        // Check if credentials match regular user
        else if (
          credentials.username === regularUser.username &&
          credentials.password === regularUser.password &&
          credentials.phone === regularUser.phone
        ) {
          set({ user: regularUser });
          return true;
        }
        return false;
      },
      logout: () => set({ user: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;