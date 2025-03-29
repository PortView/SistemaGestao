import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { DocumentFilters, PaginatedResponse, formatDate } from "@/lib/types";
import { Document, DocumentType, Property, statusClasses, statusLabels } from "@shared/schema";
import { DocumentFilters as DocumentFiltersComponent } from "./document-filters";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface DocumentsListProps {
  limit?: number;
  showFilters?: boolean;
  title?: string;
  viewAllLink?: string;
}

interface DocumentWithRelations extends Document {
  documentType: DocumentType;
  property: Property;
}

const DocumentsList = ({ limit = 10, showFilters = true, title = "Documentos", viewAllLink }: DocumentsListProps) => {
  const [location] = useLocation();
  const [filters, setFilters] = useState<DocumentFilters>({
    limit,
    page: 1,
    sort: "recent",
  });

  // Parse the URL for filters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.split('?')[1]);
    const newFilters: DocumentFilters = { ...filters };
    
    if (searchParams.has('type')) newFilters.type = searchParams.get('type') || undefined;
    if (searchParams.has('status')) newFilters.status = searchParams.get('status') || undefined;
    if (searchParams.has('search')) newFilters.search = searchParams.get('search') || undefined;
    if (searchParams.has('sort')) newFilters.sort = searchParams.get('sort') || undefined;
    if (searchParams.has('page')) {
      const page = parseInt(searchParams.get('page') || '1');
      newFilters.page = isNaN(page) ? 1 : page;
    }
    
    setFilters(newFilters);
  }, [location]);

  const { data, isLoading } = useQuery<PaginatedResponse<DocumentWithRelations>>({
    queryKey: ['/api/documents', filters],
  });

  const handleFilterChange = (newFilters: DocumentFilters) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
    
    // Update the URL with the new filters
    const searchParams = new URLSearchParams();
    if (newFilters.type) searchParams.set('type', newFilters.type);
    if (newFilters.status) searchParams.set('status', newFilters.status);
    if (newFilters.search) searchParams.set('search', newFilters.search);
    if (newFilters.sort) searchParams.set('sort', newFilters.sort);
    
    const newLocation = searchParams.toString() 
      ? `/documentos?${searchParams.toString()}`
      : '/documentos';
    
    window.history.pushState(null, '', newLocation);
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  return (
    <>
      {/* Title and filters */}
      <div className="bg-white px-4 py-5 border-b border-gray-200 sm:px-6 rounded-t-lg shadow">
        <div className="flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
          
          {viewAllLink && (
            <Link to={viewAllLink}>
              <a className="text-sm font-medium text-primary hover:text-blue-700">
                Ver todos
              </a>
            </Link>
          )}
        </div>
        
        {showFilters && (
          <DocumentFiltersComponent 
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        )}
      </div>
      
      {/* Document table */}
      <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-b-lg">
        <div className="min-w-full divide-y divide-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Propriedade</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                Array(5).fill(0).map((_, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="ml-4">
                          <Skeleton className="h-5 w-40" />
                          <Skeleton className="h-4 w-24 mt-1" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-5 w-24" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-5 w-20" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-5 w-20" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-5 w-32" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Skeleton className="h-5 w-20 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : data?.data && data.data.length > 0 ? (
                data.data.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/documento/${doc.id}`}>
                        <a className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                            <div className="text-sm text-gray-500">
                              {doc.expirationDate ? 
                                `Validade: ${formatDate(doc.expirationDate)}` :
                                `Emitido: ${formatDate(doc.issueDate)}`
                              }
                            </div>
                          </div>
                        </a>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{doc.documentType?.name || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={statusClasses[doc.status]}>
                        {statusLabels[doc.status]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(doc.issueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {doc.property?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/documento/${doc.id}`}>
                        <Button variant="ghost" className="text-primary hover:text-blue-800">
                          Visualizar
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    Nenhum documento encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {data?.meta && data.meta.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                variant="outline"
                disabled={data.meta.page <= 1}
                onClick={() => handlePageChange(data.meta.page - 1)}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                disabled={data.meta.page >= data.meta.totalPages}
                onClick={() => handlePageChange(data.meta.page + 1)}
              >
                Próximo
              </Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{((data.meta.page - 1) * data.meta.limit) + 1}</span>{' '}
                  a <span className="font-medium">
                    {Math.min(data.meta.page * data.meta.limit, data.meta.total)}
                  </span>{' '}
                  de <span className="font-medium">{data.meta.total}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <Button
                    variant="outline"
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium"
                    disabled={data.meta.page <= 1}
                    onClick={() => handlePageChange(data.meta.page - 1)}
                  >
                    <span className="sr-only">Anterior</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </Button>
                  
                  {Array.from({ length: Math.min(5, data.meta.totalPages) }).map((_, idx) => {
                    let pageNumber: number;
                    
                    // Calculate page numbers to show (center current page)
                    if (data.meta.totalPages <= 5) {
                      pageNumber = idx + 1;
                    } else {
                      const start = Math.max(1, data.meta.page - 2);
                      const end = Math.min(data.meta.totalPages, start + 4);
                      pageNumber = start + idx;
                      
                      if (pageNumber > data.meta.totalPages) return null;
                    }
                    
                    return (
                      <Button
                        key={pageNumber}
                        variant={pageNumber === data.meta.page ? "default" : "outline"}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pageNumber === data.meta.page 
                            ? "z-10 bg-primary border-primary text-white" 
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                        onClick={() => handlePageChange(pageNumber)}
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                  
                  {data.meta.totalPages > 5 && data.meta.page < data.meta.totalPages - 2 && (
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      ...
                    </span>
                  )}
                  
                  {data.meta.totalPages > 5 && data.meta.page < data.meta.totalPages - 1 && (
                    <Button
                      variant="outline"
                      className="relative inline-flex items-center px-4 py-2 border text-sm font-medium bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      onClick={() => handlePageChange(data.meta.totalPages)}
                    >
                      {data.meta.totalPages}
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium"
                    disabled={data.meta.page >= data.meta.totalPages}
                    onClick={() => handlePageChange(data.meta.page + 1)}
                  >
                    <span className="sr-only">Próximo</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DocumentsList;
