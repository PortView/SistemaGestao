import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Building2, MapPin, Home } from "lucide-react";
import { Property } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

export default function Properties() {
  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
  });

  return (
    <div className="flex-1 relative pb-8 z-0 overflow-y-auto">
      {/* Page header */}
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
          <div className="py-6 md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">Propriedades</h2>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <Button>
                <Plus className="-ml-1 mr-2 h-4 w-4" />
                Nova Propriedade
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array(6).fill(0).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="h-48 bg-gray-200">
                    <Skeleton className="h-full w-full" />
                  </div>
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))
            ) : properties && properties.length > 0 ? (
              properties.map((property) => (
                <Card key={property.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-48 bg-gray-100 flex items-center justify-center">
                    <Building2 className="h-24 w-24 text-gray-300" />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{property.name}</h3>
                    <div className="flex items-start space-x-2 text-gray-500 mb-1">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{property.address}, {property.city}, {property.state}</p>
                    </div>
                    <div className="flex items-start space-x-2 text-gray-500">
                      <Home className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">Nº Registro: {property.registrationNumber || 'N/A'}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
                      <Link href={`/propriedades/${property.id}`}>
                        <Button variant="link" className="text-primary p-0 h-auto">Ver detalhes</Button>
                      </Link>
                      <Link href={`/documentos?property=${property.id}`}>
                        <Button variant="link" className="text-primary p-0 h-auto">Ver documentos</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-12 flex flex-col items-center justify-center text-center">
                <Building2 className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma propriedade encontrada</h3>
                <p className="text-gray-500 mb-4 max-w-md">
                  Você ainda não cadastrou nenhuma propriedade. Clique no botão abaixo para adicionar uma nova.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar propriedade
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
