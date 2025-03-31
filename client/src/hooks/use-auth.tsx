import { createContext, useContext, useEffect, useState, ReactNode } from "react";
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const queryClient = useQueryClient();

  // Verifica se há um token no localStorage
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // Função para buscar o perfil do usuário da API externa
  const fetchUserProfile = async (token: string) => {
    try {
      const apiMeUrl = import.meta.env.VITE_NEXT_PUBLIC_API_ME_URL;
      console.log("URL da API de perfil (useAuth):", apiMeUrl);
      
      const response = await fetch(apiMeUrl, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        console.error("Erro na resposta da API (useAuth):", response.status, response.statusText);
        const errorText = await response.text();
        console.error("Detalhe do erro (useAuth):", errorText);
        throw new Error("Erro ao buscar perfil do usuário");
      }
      
      const userData = await response.json();
      console.log("Dados do usuário obtidos (useAuth):", userData);
      
      // Salva os dados do usuário no localStorage
      if (userData) {
        localStorage.setItem('user_name', userData.name || '');
        localStorage.setItem('user_tipo', userData.tipo || userData.role || 'Analista');
        
        if (userData.cod) {
          localStorage.setItem('user_cod', userData.cod.toString() || '');
        }
        
        localStorage.setItem('user_email', userData.email || '');
        
        if (userData.mvvm) {
          localStorage.setItem('user_mvvm', userData.mvvm || '');
        }
      }
      
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
      const token = localStorage.getItem("auth_token");
      if (!token) return null;
      
      // Tentamos obter os dados do usuário da API externa
      const userProfile = await fetchUserProfile(token);
      return userProfile;
    },
    enabled: !!localStorage.getItem("auth_token"),
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 1,
  });

  // Função para login
  const login = (token: string) => {
    localStorage.setItem("auth_token", token);
    setIsAuthenticated(true);
    queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
  };

  // Função para logout
  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_tipo");
    localStorage.removeItem("user_cod");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_mvvm");
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