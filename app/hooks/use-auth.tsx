'use client';

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { SiscopUser } from '../lib/types';
import { ApiService } from '../lib/api-service';
import { useToast } from './use-toast';

interface AuthContextType {
  user: SiscopUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const LOCAL_STORAGE_TOKEN_KEY = 'siscop_token';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SiscopUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Função para buscar o perfil do usuário
  const fetchUserProfile = async (token: string) => {
    try {
      const userData = await ApiService.get<SiscopUser>('/auth/me');
      setUser(userData);
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
      // Se houver erro, remover o token do localStorage
      localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar token no localStorage ao montar o componente
  useEffect(() => {
    const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
    if (token) {
      fetchUserProfile(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  // Função para login
  const login = (token: string) => {
    localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, token);
    fetchUserProfile(token);
  };

  // Função para logout
  const logout = () => {
    localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
    setUser(null);
    toast({
      title: 'Logout realizado',
      description: 'Você foi desconectado com sucesso.',
    });
  };

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