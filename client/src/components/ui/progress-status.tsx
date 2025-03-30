import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ProgressStatus = "idle" | "loading" | "success" | "error";

interface ProgressStatusProps {
  status: ProgressStatus;
  label?: string;
  className?: string;
}

export function ProgressStatus({ 
  status, 
  label, 
  className 
}: ProgressStatusProps) {
  const icons = {
    idle: null,
    loading: <Loader2 className="h-5 w-5 animate-spin text-blue-500" />,
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />
  };

  const statusText = {
    idle: "",
    loading: label || "Processando...",
    success: label || "Concluído",
    error: label || "Erro"
  };

  if (status === "idle") return null;
  
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {icons[status]}
      <span className={cn(
        "text-sm",
        status === "loading" && "text-blue-500",
        status === "success" && "text-green-500",
        status === "error" && "text-red-500"
      )}>
        {statusText[status]}
      </span>
    </div>
  );
}