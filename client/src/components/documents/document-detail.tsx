import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { DocumentWithRelations, formatDate } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { statusClasses, statusLabels } from "@shared/schema";
import { 
  FileText, 
  Calendar, 
  Building2, 
  InfoIcon, 
  Download, 
  Share2, 
  Printer, 
  ArrowLeft
} from "lucide-react";
import { Link } from "wouter";
import { Separator } from "@/components/ui/separator";

const DocumentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const documentId = parseInt(id);
  
  const { data: document, isLoading } = useQuery<DocumentWithRelations>({
    queryKey: [`/api/documents/${documentId}`],
    enabled: !isNaN(documentId),
  });
  
  if (isNaN(documentId)) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12">
              <InfoIcon className="h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">ID de documento inválido</h2>
              <p className="text-gray-600 mb-4">O ID do documento especificado não é válido.</p>
              <Link href="/documentos">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para documentos
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="pb-5 mb-5 border-b border-gray-200 flex justify-between items-center">
        <div>
          <Link href="/documentos">
            <Button variant="link" className="p-0 text-primary">
              <ArrowLeft className="h-4 w-4 mr-1" /> Voltar para documentos
            </Button>
          </Link>
          <h1 className="text-2xl font-bold leading-7 text-gray-900 mt-2">
            {isLoading ? <Skeleton className="h-8 w-64" /> : document?.title}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Baixar
          </Button>
          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Compartilhar
          </Button>
          <Button variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Informações do Documento</CardTitle>
              <CardDescription>Detalhes principais do documento.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between border-b pb-3">
                    <span className="font-medium text-gray-500">Número do Documento</span>
                    <span>{document?.documentNumber}</span>
                  </div>
                  <div className="flex justify-between border-b pb-3">
                    <span className="font-medium text-gray-500">Tipo</span>
                    <span>{document?.documentType?.name}</span>
                  </div>
                  <div className="flex justify-between border-b pb-3">
                    <span className="font-medium text-gray-500">Status</span>
                    <Badge className={document ? statusClasses[document.status] : ""}>
                      {document ? statusLabels[document.status] : ""}
                    </Badge>
                  </div>
                  <div className="flex justify-between border-b pb-3">
                    <span className="font-medium text-gray-500">Data de Emissão</span>
                    <span>{formatDate(document?.issueDate)}</span>
                  </div>
                  <div className="flex justify-between border-b pb-3">
                    <span className="font-medium text-gray-500">Validade</span>
                    <span>{formatDate(document?.expirationDate) || "Não expira"}</span>
                  </div>
                  {document?.notes && (
                    <div className="pt-2">
                      <span className="font-medium text-gray-500 block mb-2">Observações</span>
                      <div className="bg-gray-50 p-3 rounded-md text-gray-700">{document.notes}</div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Document preview card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Visualização do Documento</CardTitle>
              <CardDescription>Pré-visualização do documento digitalizado.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-96 w-full" />
              ) : document?.fileUrl ? (
                <div className="border rounded-md overflow-hidden h-96">
                  <iframe 
                    src={document.fileUrl} 
                    className="w-full h-full" 
                    title={document.title}
                  ></iframe>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-md">
                  <FileText className="h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-gray-600">A visualização do documento não está disponível</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Property info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Propriedade</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start">
                    <Building2 className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
                    <div>
                      <p className="font-medium">{document?.property?.name}</p>
                      <p className="text-sm text-gray-500">{document?.property?.address}</p>
                      <p className="text-sm text-gray-500">
                        {document?.property?.city}, {document?.property?.state} - {document?.property?.zipCode}
                      </p>
                    </div>
                  </div>
                  
                  {document?.property?.registrationNumber && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Nº de Registro</p>
                        <p>{document.property.registrationNumber}</p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Timeline/status history */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Histórico de Status</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute top-0 left-3 h-full w-0.5 bg-gray-200"></div>
                  <ul className="space-y-6">
                    <li className="relative pl-8">
                      <div className="absolute left-0 top-1 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center border-2 border-white z-10">
                        <span className="h-2 w-2 bg-green-600 rounded-full"></span>
                      </div>
                      <p className="text-sm font-medium">Documento aprovado</p>
                      <p className="text-xs text-gray-500">10/05/2023 às 14:30</p>
                      <p className="text-xs text-gray-700 mt-1">Aprovado por Juliana Mendes</p>
                    </li>
                    <li className="relative pl-8">
                      <div className="absolute left-0 top-1 h-6 w-6 rounded-full bg-yellow-100 flex items-center justify-center border-2 border-white z-10">
                        <span className="h-2 w-2 bg-yellow-600 rounded-full"></span>
                      </div>
                      <p className="text-sm font-medium">Em análise</p>
                      <p className="text-xs text-gray-500">05/05/2023 às 09:15</p>
                      <p className="text-xs text-gray-700 mt-1">Início da análise pelo departamento técnico</p>
                    </li>
                    <li className="relative pl-8">
                      <div className="absolute left-0 top-1 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center border-2 border-white z-10">
                        <span className="h-2 w-2 bg-blue-600 rounded-full"></span>
                      </div>
                      <p className="text-sm font-medium">Documento enviado</p>
                      <p className="text-xs text-gray-500">02/05/2023 às 16:45</p>
                      <p className="text-xs text-gray-700 mt-1">Documento registrado no sistema</p>
                    </li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Related documents */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Documentos Relacionados</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <ul className="space-y-3">
                  <li>
                    <Link href="/documento/123">
                      <a className="flex items-center p-2 hover:bg-gray-50 rounded-md">
                        <FileText className="h-5 w-5 text-gray-500 mr-2" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">IPTU 2023</p>
                          <p className="text-xs text-gray-500">Último pagamento: 10/01/2023</p>
                        </div>
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/documento/456">
                      <a className="flex items-center p-2 hover:bg-gray-50 rounded-md">
                        <FileText className="h-5 w-5 text-gray-500 mr-2" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">Matrícula do Imóvel</p>
                          <p className="text-xs text-gray-500">Atualizada: 23/03/2023</p>
                        </div>
                      </a>
                    </Link>
                  </li>
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetail;
