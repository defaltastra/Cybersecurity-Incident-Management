import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import type { User, LoginRequest, RegisterRequest, UpdateProfileRequest } from '../types';
import { loginUser, registerUser, updateProfile as apiUpdateProfile } from '../lib/api';

interface AuthContextValue {
  user: User | null;
  login: (req: LoginRequest) => Promise<void>;
  register: (req: RegisterRequest) => Promise<void>;
  updateProfile: (req: UpdateProfileRequest) => Promise<void>;
  disconnect: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'cim_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  async function login(req: LoginRequest): Promise<void> {
    const u = await loginUser(req);
    setUser(u);
  }

  async function register(req: RegisterRequest): Promise<void> {
    const u = await registerUser(req);
    setUser(u);
  }

  async function updateProfile(req: UpdateProfileRequest): Promise<void> {
    if (!user) throw new Error('not authenticated');
    const updated = await apiUpdateProfile(user.id, req);
    setUser(updated);
  }

  function disconnect(): void {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, updateProfile, disconnect }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
