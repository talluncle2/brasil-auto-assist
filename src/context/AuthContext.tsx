import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';
import { getFromLocalStorage, setToLocalStorage } from '@/hooks/useLocalStorage';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

// Demo users for the repair shop
const DEMO_USERS: User[] = [
  {
    id: '1',
    email: 'admin@oficinanovabrasil.com',
    name: 'Administrador',
    role: 'admin'
  },
  {
    id: '2',
    email: 'usuario@oficinanovabrasil.com',
    name: 'Usuário',
    role: 'user'
  }
];

// Simple password for demo (in real app, this would be properly hashed)
const DEMO_PASSWORD = '123456';

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const savedUser = getFromLocalStorage<User | null>('auth_user', null);
    if (savedUser) {
      setUser(savedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check credentials
    if (password !== DEMO_PASSWORD) {
      return false;
    }

    const foundUser = DEMO_USERS.find(u => u.email === email);
    if (!foundUser) {
      return false;
    }

    setUser(foundUser);
    setToLocalStorage('auth_user', foundUser);
    return true;
  };

  const logout = () => {
    setUser(null);
    setToLocalStorage('auth_user', null);
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};