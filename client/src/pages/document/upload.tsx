import MainLayout from "@/components/layout/main-layout";
import { DocumentUpload } from "@/components/documents/document-upload";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function DocumentUploadPage() {
  const handleComplete = (files: File[]) => {
    console.log("Upload concluído:", files);
    // Aqui você poderia redirecionar o usuário ou realizar alguma ação após o upload
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-white">Upload de Documentos</h1>
          <Button asChild variant="outline">
            <Link href="/documents">
              Voltar para Documentos
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-gray-850 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-medium text-white mb-4">
              Instruções para Upload
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Selecione documentos relevantes para o processo</li>
              <li>Formatos aceitos: PDF, JPEG, PNG</li>
              <li>Tamanho máximo por arquivo: 10MB</li>
              <li>Certifique-se que os documentos estão legíveis</li>
              <li>Após o upload, os documentos serão verificados pela equipe responsável</li>
            </ul>
          </div>
          
          <DocumentUpload 
            onComplete={handleComplete}
            maxFiles={5}
            title="Upload de Documentos do Processo"
            description="Arraste documentos aqui ou clique para selecionar"
          />
        </div>
      </div>
    </MainLayout>
  );
}