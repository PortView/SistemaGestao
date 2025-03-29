import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { DocumentFilters as FiltersType } from "@/lib/types";
import { DocumentType } from "@shared/schema";
import { RefreshCw, LayoutGrid, List } from "lucide-react";

interface DocumentFiltersProps {
  filters: FiltersType;
  onFilterChange: (filters: FiltersType) => void;
}

export const DocumentFilters = ({ filters, onFilterChange }: DocumentFiltersProps) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  
  const { data: documentTypes } = useQuery<DocumentType[]>({
    queryKey: ["/api/document-types"],
  });

  const handleTypeChange = (value: string) => {
    onFilterChange({ ...filters, type: value === "all" ? undefined : value });
  };

  const handleStatusChange = (value: string) => {
    onFilterChange({ ...filters, status: value === "all" ? undefined : value });
  };

  const handleSortChange = (value: string) => {
    onFilterChange({ ...filters, sort: value });
  };

  const handleRefresh = () => {
    // Invalidate the documents query to force a refetch
    window.location.reload();
  };

  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode);
    // You could store this preference in localStorage
    localStorage.setItem("viewMode", mode);
  };

  useEffect(() => {
    // Load view mode preference from localStorage
    const savedViewMode = localStorage.getItem("viewMode") as "grid" | "list" | null;
    if (savedViewMode) {
      setViewMode(savedViewMode);
    }
  }, []);

  return (
    <div className="mt-4 flex flex-wrap gap-4 items-center justify-between">
      <div className="flex flex-wrap gap-2">
        <Select value={filters.type || "all"} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Todos os tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {documentTypes?.map((type) => (
              <SelectItem key={type.id} value={type.id.toString()}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={filters.status || "all"} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="em_analise">Em análise</SelectItem>
            <SelectItem value="aprovado">Aprovado</SelectItem>
            <SelectItem value="expirado">Expirado</SelectItem>
            <SelectItem value="rejeitado">Rejeitado</SelectItem>
            <SelectItem value="arquivado">Arquivado</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filters.sort || "recent"} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Ordenar por: Recentes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Ordenar por: Recentes</SelectItem>
            <SelectItem value="oldest">Ordenar por: Antigos</SelectItem>
            <SelectItem value="name">Ordenar por: Nome</SelectItem>
            <SelectItem value="priority">Ordenar por: Prioridade</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex mt-2 sm:mt-0">
        <Button 
          variant="outline" 
          size="sm"
          className="inline-flex items-center"
          onClick={handleRefresh}
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Atualizar
        </Button>
        
        <div className="ml-2 flex">
          <Button
            variant="ghost"
            size="icon"
            className={`p-1 rounded-md ${viewMode === 'grid' ? 'text-primary' : 'text-gray-400 hover:text-gray-500'}`}
            onClick={() => handleViewModeChange('grid')}
          >
            <span className="sr-only">Visualizar em grade</span>
            <LayoutGrid className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`p-1 rounded-md ${viewMode === 'list' ? 'text-primary' : 'text-gray-400 hover:text-gray-500'}`}
            onClick={() => handleViewModeChange('list')}
          >
            <span className="sr-only">Visualizar em lista</span>
            <List className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
