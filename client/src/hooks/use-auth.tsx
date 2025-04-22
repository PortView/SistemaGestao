import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_ME_URL, LOCAL_STORAGE_TOKEN_KEY, LOCAL_STORAGE_USER_KEY } from '../lib/env';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { SiscopUser } from "@/lib/types";

interface AuthContextType {
  user: User | SiscopUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const queryClient = useQueryClient();

  // Verificar se há um token no localStorage ao inicializar
  useEffect(() => {
    const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
    const userJson = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (token && userJson) {
      setIsAuthenticated(true);
    }
  }, []);

  // Função para buscar o perfil do usuário da API externa
  const fetchUserProfile = async (token: string) => {
    try {
      const apiMeUrl = API_ME_URL;
      console.log("URL da API de perfil (useAuth):", apiMeUrl);
      
      // Adiciona opções para contornar problemas de SSL em ambiente de desenvolvimento
      const options = {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        // No ambiente React, problemas de SSL são gerenciados pelo navegador
        // então não é necessário adicionar opções adicionais aqui
      };
      
      const response = await fetch(apiMeUrl, options);
      
      if (!response.ok) {
        console.error("Erro na resposta da API (useAuth):", response.status, response.statusText);
        const errorText = await response.text();
        console.error("Detalhe do erro (useAuth):", errorText);
        throw new Error("Erro ao buscar perfil do usuário");
      }
      
      const userData = await response.json();
      console.log("Dados do usuário obtidos (useAuth):", userData);
      
      // Salva os dados do usuário no localStorage
      // Salvar o token no localStorage
      localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, token);
      
      // Salvar o usuário no localStorage
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userData));
      
      return userData;
    } catch (error) {
      console.error("Erro ao buscar perfil do usuário:", error);
      return null;
    }
  };

  // Busca o usuário atual
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/user/profile"],
    queryFn: async () => {
      const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
      if (!token) return null;
      
      // Tentamos obter os dados do usuário da API externa
      const userProfile = await fetchUserProfile(token);
      return userProfile;
    },
    enabled: !!localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY),
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 1,
  });

  // Função para login
  const login = (token: string) => {
    localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, token);
    setIsAuthenticated(true);
    queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
  };

  // Função para logout
  const logout = () => {
    // Remover o token e o usuário do localStorage
    localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    setIsAuthenticated(false);
    queryClient.invalidateQueries();
    queryClient.clear();
  };

  const value: AuthContextType = {
    user: user || null,
    isLoading,
    isAuthenticated,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}