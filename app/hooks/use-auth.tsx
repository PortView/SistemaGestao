'use client';

import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { SiscopUser } from '../lib/types';
import { fetchUserProfile as fetchProfile } from '../lib/api-service';
import { LOCAL_STORAGE_TOKEN_KEY, LOCAL_STORAGE_USER_KEY } from '../lib/constants';
import { useToast } from './use-toast';

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
  const { toast } = useToast();

  // Função para buscar o perfil do usuário
  const getUserProfile = async (token: string) => {
    try {
      // Usando a função importada do api-service
      const userData = await fetchProfile();
      console.log('Dados do usuário obtidos (useAuth):', userData);
      setUser(userData);
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
      // Se houver erro, remover o token do localStorage
      localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar token no localStorage ao montar o componente
  useEffect(() => {
    const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
    if (token) {
      getUserProfile(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  // Função para login
  const login = (token: string) => {
    localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, token);
    getUserProfile(token);
  };

  // Função para logout
  const logout = () => {
    localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}