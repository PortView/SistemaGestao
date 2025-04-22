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
      className="min-h-screen flex items-center justify-center bg-black px-4 py-12 sm:px-6 lg:px-8"
      style={{
        backgroundSize: "cover",
      }}
    >
      <div className="w-full max-w-md space-y-8 p-8 rounded-lg bg-gray-900 shadow-xl border border-gray-800">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            SISCOP
          </h1>
          <h2 className="mt-2 text-lg text-gray-400">
            Sistema de Controle de processos
          </h2>
        </div>

        <LoginForm onSuccess={handleLoginSuccess} />
        <p className="text-sm text-muted-foreground">
          © 2025 SISCOP - Todos os direitos reservados
        </p>
      </div>
    </div>
  );
}