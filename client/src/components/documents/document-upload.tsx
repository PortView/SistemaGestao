import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ProgressStatus } from "@/components/ui/progress-status";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface FileWithPreview extends File {
  preview?: string;
}

interface DocumentUploadProps {
  onComplete?: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // em bytes
  allowedTypes?: string[];
  title?: string;
  description?: string;
}

export function DocumentUpload({
  onComplete,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB padrão
  allowedTypes = ["application/pdf", "image/jpeg", "image/png"],
  title = "Upload de Documentos",
  description = "Arraste e solte os arquivos aqui ou clique para selecionar"
}: DocumentUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadStatus, setUploadStatus] = useState<Record<string, "idle" | "loading" | "success" | "error">>({});
  const [isUploading, setIsUploading] = useState(false);
  
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Verificamos o limite de arquivos
    if (files.length + acceptedFiles.length > maxFiles) {
      toast({
        title: "Limite de arquivos excedido",
        description: `Você pode enviar no máximo ${maxFiles} arquivos`,
        variant: "destructive"
      });
      return;
    }
    
    // Adicionamos os arquivos aceitos à lista
    const newFiles = acceptedFiles.map((file) => 
      Object.assign(file, {
        preview: file.type.startsWith("image/") 
          ? URL.createObjectURL(file) 
          : undefined
      })
    );
    
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    
    // Inicializamos o progresso e status para cada arquivo
    const progressUpdates: Record<string, number> = {};
    const statusUpdates: Record<string, "idle" | "loading" | "success" | "error"> = {};
    
    newFiles.forEach((file) => {
      progressUpdates[file.name] = 0;
      statusUpdates[file.name] = "idle";
    });
    
    setUploadProgress((prev) => ({ ...prev, ...progressUpdates }));
    setUploadStatus((prev) => ({ ...prev, ...statusUpdates }));
  }, [files, maxFiles, toast]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: allowedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize,
    disabled: isUploading,
    onDropRejected: (rejections) => {
      rejections.forEach((rejection) => {
        const { file, errors } = rejection;
        
        if (errors.some(e => e.code === "file-too-large")) {
          toast({
            title: "Arquivo muito grande",
            description: `O arquivo ${file.name} excede o tamanho máximo permitido`,
            variant: "destructive"
          });
        } else if (errors.some(e => e.code === "file-invalid-type")) {
          toast({
            title: "Tipo de arquivo inválido",
            description: `O arquivo ${file.name} não é de um tipo permitido`,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Erro ao adicionar arquivo",
            description: `O arquivo ${file.name} não pôde ser adicionado`,
            variant: "destructive"
          });
        }
      });
    }
  });
  
  const removeFile = (name: string) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== name));
    
    // Removemos o progresso e status do arquivo
    setUploadProgress((prev) => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
    
    setUploadStatus((prev) => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
  };
  
  // Simulação de upload de arquivos
  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      setIsUploading(true);
      
      // Para cada arquivo, simulamos o upload
      const promises = files.map(async (file) => {
        // Inicializamos o status para "loading"
        setUploadStatus(prev => ({ ...prev, [file.name]: "loading" }));
        
        // Simulamos o progresso de upload
        const steps = 10;
        for (let i = 1; i <= steps; i++) {
          await new Promise(resolve => setTimeout(resolve, 300));
          const progress = Math.round((i / steps) * 100);
          setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
        }
        
        // 90% de chance de sucesso (para demonstração)
        const isSuccess = Math.random() > 0.1;
        
        if (isSuccess) {
          setUploadStatus(prev => ({ ...prev, [file.name]: "success" }));
          return file;
        } else {
          setUploadStatus(prev => ({ ...prev, [file.name]: "error" }));
          throw new Error(`Falha ao enviar ${file.name}`);
        }
      });
      
      try {
        const results = await Promise.allSettled(promises);
        const successfulUploads = results
          .filter((result): result is PromiseFulfilledResult<File> => result.status === "fulfilled")
          .map(result => result.value);
        
        return successfulUploads;
      } finally {
        setIsUploading(false);
      }
    },
    onSuccess: (uploadedFiles) => {
      toast({
        title: "Upload concluído",
        description: `${uploadedFiles.length} arquivo(s) foram enviados com sucesso`
      });
      
      if (onComplete) {
        onComplete(uploadedFiles);
      }
    },
    onError: (error) => {
      toast({
        title: "Erro no upload",
        description: "Alguns arquivos não puderam ser enviados. Tente novamente.",
        variant: "destructive"
      });
    }
  });
  
  const handleUpload = () => {
    if (files.length === 0) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Adicione pelo menos um arquivo para fazer o upload",
        variant: "destructive"
      });
      return;
    }
    
    uploadMutation.mutate(files);
  };
  
  const getFileIcon = (file: FileWithPreview) => {
    if (file.type.startsWith("image/")) {
      return file.preview ? (
        <img
          src={file.preview}
          alt={file.name}
          className="h-8 w-8 object-cover rounded"
        />
      ) : (
        <File className="h-6 w-6 text-gray-400" />
      );
    }
    
    if (file.type === "application/pdf") {
      return <FileText className="h-6 w-6 text-red-500" />;
    }
    
    return <File className="h-6 w-6 text-gray-400" />;
  };
  
  return (
    <Card className="w-full bg-gray-800 border-gray-700 text-white">
      <CardHeader>
        <CardTitle className="text-xl text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed border-gray-600 rounded-lg p-8 text-center flex flex-col items-center justify-center cursor-pointer",
            isDragActive && "border-blue-500 bg-blue-950/20",
            isUploading && "opacity-50 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />
          <Upload className={cn(
            "h-12 w-12 mb-4",
            isDragActive ? "text-blue-500" : "text-gray-400"
          )} />
          <p className="text-lg font-medium mb-1">
            {isDragActive ? "Solte os arquivos aqui" : description}
          </p>
          <p className="text-sm text-gray-400">
            Tipos permitidos: {allowedTypes.map(type => type.replace('application/', '').replace('image/', '')).join(', ')}
          </p>
          <p className="text-sm text-gray-400">
            Tamanho máximo: {maxSize / (1024 * 1024)}MB
          </p>
        </div>
        
        {files.length > 0 && (
          <div className="space-y-2 mt-4">
            <h3 className="text-sm font-medium text-gray-300 mb-2">
              Arquivos ({files.length}/{maxFiles})
            </h3>
            <ul className="space-y-2">
              {files.map((file) => (
                <li
                  key={file.name}
                  className="bg-gray-700 rounded-md p-3 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    {getFileIcon(file)}
                    <div>
                      <p className="text-sm font-medium text-gray-200 truncate max-w-xs">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <ProgressStatus 
                      status={uploadStatus[file.name] || "idle"} 
                    />
                    
                    {uploadStatus[file.name] === "loading" && (
                      <div className="w-24">
                        <Progress
                          value={uploadProgress[file.name]}
                          className="h-2 bg-gray-600"
                        />
                      </div>
                    )}
                    
                    {(!isUploading || uploadStatus[file.name] === "error") && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(file.name)}
                        className="h-8 w-8 rounded-full hover:bg-gray-600"
                      >
                        <X className="h-4 w-4 text-gray-400" />
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          onClick={handleUpload}
          disabled={files.length === 0 || isUploading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            "Enviar documentos"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}