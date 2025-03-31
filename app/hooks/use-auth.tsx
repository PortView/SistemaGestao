'use client';

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { SiscopUser } from '@/lib/types';
import { apiRequest } from '@/lib/queryClient';

interface AuthContextType {
  user: SiscopUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SiscopUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Função para fazer login
  const login = async (token: string) => {
    try {
      // Salva o token no localStorage
      localStorage.setItem('access_token', token);
      
      // Busca os dados do usuário
      await fetchUserProfile();
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      logout();
    }
  };

  // Função para fazer logout
  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };

  // Função para buscar o perfil do usuário
  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      
      // Busca os dados do usuário na API
      const response = await apiRequest(
        'GET',
        process.env.VITE_NEXT_PUBLIC_API_ME_URL || '',
      );
      
      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  // Verifica a autenticação ao carregar
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    
    if (token) {
      fetchUserProfile();
    } else {
      setIsLoading(false);
    }
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
}