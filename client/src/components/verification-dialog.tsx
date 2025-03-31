import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Server } from "lucide-react";

export function VerificationDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [clientCount, setClientCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      checkApiResults();
    }
  }, [open]);

  const checkApiResults = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);

      const userDataStr = localStorage.getItem("siscop_user");

      if (!token) {
        throw new Error(
          "Token não encontrado. Por favor, faça login novamente.",
        );
      }

      if (!userDataStr) {
        throw new Error(
          "Dados do usuário não encontrados. Por favor, faça login novamente.",
        );
      }

      let userData;
      try {
        userData = JSON.parse(userDataStr);
      } catch (e) {
        throw new Error(
          "Erro ao processar dados do usuário. Por favor, faça login novamente.",
        );
      }

      if (!userData?.cod) {
        throw new Error(
          "Código do usuário não encontrado. Por favor, faça login novamente.",
        );
      }

      const apiUrl = import.meta.env.VITE_NEXT_PUBLIC_API_CLIENTES_URL;
      if (!apiUrl) {
        throw new Error("URL da API não configurada corretamente.");
      }

      console.log(
        "Fazendo requisição para:",
        `${apiUrl}?codcoor=${userData.cod}`,
      );
      console.log("Token:", token);
      console.log("Código do usuário:", userData.cod);

      const response = await fetch(`${apiUrl}?codcoor=${userData.cod}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Erro na API: ${response.status} - ${response.statusText}`,
        );
      }

      const data = await response.json();
      console.log("Resposta da API:", data);
      setClientCount(Array.isArray(data) ? data.length : 0);
    } catch (err) {
      console.error("Erro na verificação:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erro desconhecido ao acessar a API",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="dark:bg-gray-800 dark:text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            <span>Verificação da API</span>
          </DialogTitle>
          <DialogDescription>
            Verificando a conexão com a API de clientes usando token de
            autenticação e parâmetro codcoor
          </DialogDescription>
        </DialogHeader>
        <div className="p-4">
          {loading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              <span className="ml-2">Carregando dados...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 rounded-md p-4 mb-4">
              <div className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-red-500 mr-2 mt-0.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            </div>
          )}

          {clientCount !== null && !loading && !error && (
            <div className="bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-800 rounded-md p-4">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-green-500 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="font-medium text-green-700 dark:text-green-400">
                    Conexão com API bem-sucedida!
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                    Quantidade de clientes encontrados:{" "}
                    <span className="font-bold">{clientCount}</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
