import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { User } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const queryClient = useQueryClient();

  // Configura os headers para incluir o token de autenticação se disponível
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      // Configura o cabeçalho de autorização para todas as requisições
      queryClient.setDefaultOptions({
        queries: {
          refetchOnWindowFocus: false,
        },
      });
    }
  }, [queryClient]);

  // Busca o usuário atual
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/me"],
    enabled: !!localStorage.getItem("auth_token"),
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 1,
  });

  // Atualiza o estado de autenticação quando o usuário muda
  useEffect(() => {
    if (user) {
      setIsAuthenticated(true);
    } else if (!isLoading && !user && localStorage.getItem("auth_token")) {
      // Se não há usuário mas há token, o token pode ser inválido
      localStorage.removeItem("auth_token");
      setIsAuthenticated(false);
    }
  }, [user, isLoading]);

  // Função para login
  const login = (token: string) => {
    localStorage.setItem("auth_token", token);
    setIsAuthenticated(true);
    queryClient.invalidateQueries({ queryKey: ["/api/me"] });
  };

  // Effect para salvar dados do usuário no localStorage quando disponíveis
  useEffect(() => {
    if (user) {
      localStorage.setItem("user_name", user.name || '');
      
      // Verifica se o usuário é um SiscopUser ou User normal
      const userData = user as any; // usando any temporariamente para evitar erros de tipo
      
      if (userData.tipo) {
        localStorage.setItem("user_tipo", userData.tipo);
      } else if (userData.role) {
        localStorage.setItem("user_tipo", userData.role);
      } else {
        localStorage.setItem("user_tipo", 'Analista'); // Valor padrão
      }
    }
  }, [user]);

  // Função para logout
  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_tipo");
    setIsAuthenticated(false);
    queryClient.invalidateQueries();
    queryClient.clear();
  };

  const value: AuthContextType = {
    user: (user as User) || null,
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