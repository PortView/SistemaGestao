import { useEffect } from "react";
import { useLocation } from "wouter";
import { LoginForm } from "@/components/auth/login-form";
import { useAuth } from "@/hooks/use-auth";

export default function LoginPage() {
  const [location, navigate] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  
  useEffect(() => {
    // Se o usuário já estiver autenticado, redireciona para o dashboard
    if (isAuthenticated && user) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, user, navigate]);

  // Função chamada após login bem-sucedido
  const handleLoginSuccess = () => {
    navigate("/dashboard");
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8"
      style={{
        backgroundImage: "linear-gradient(to right bottom, #f0f9ff, #e0f2fe, #bae6fd)",
        backgroundSize: "cover",
      }}
    >
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            SISCOP
          </h1>
          <h2 className="mt-2 text-lg text-gray-600">
            Sistema de Gerenciamento de Documentos Imobiliários
          </h2>
        </div>
        
        <LoginForm onSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
}