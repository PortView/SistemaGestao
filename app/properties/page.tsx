'use client';

import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Search, Home, MapPin } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

/**
 * Página de listagem de propriedades/imóveis
 * Permite visualizar e filtrar imóveis por diferentes critérios
 */
export default function PropertiesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState('');
  
  // Dados simulados para demonstração
  const properties = [
    { id: 1, title: 'Apartamento Centro', address: 'Rua das Flores, 123', city: 'São Paulo', state: 'SP', type: 'Apartamento', area: 75 },
    { id: 2, title: 'Casa Jardins', address: 'Av. das Palmeiras, 456', city: 'Rio de Janeiro', state: 'RJ', type: 'Casa', area: 150 },
    { id: 3, title: 'Sala Comercial', address: 'Rua do Comércio, 789', city: 'Belo Horizonte', state: 'MG', type: 'Comercial', area: 50 },
    { id: 4, title: 'Terreno Zona Sul', address: 'Estrada Principal, s/n', city: 'Porto Alegre', state: 'RS', type: 'Terreno', area: 500 },
    { id: 5, title: 'Galpão Industrial', address: 'Rodovia BR-101, km 23', city: 'Curitiba', state: 'PR', type: 'Industrial', area: 1200 },
    { id: 6, title: 'Cobertura Duplex', address: 'Av. Beira Mar, 1001', city: 'Florianópolis', state: 'SC', type: 'Apartamento', area: 180 },
  ];
  
  // Filtrar propriedades com base no termo de pesquisa e estado selecionado
  const filteredProperties = properties.filter(prop => {
    const matchesSearch = 
      prop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prop.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prop.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesState = filterState ? prop.state === filterState : true;
    
    return matchesSearch && matchesState;
  });
  
  // Lista de estados para o filtro
  const states = [
    { value: 'SP', label: 'São Paulo' },
    { value: 'RJ', label: 'Rio de Janeiro' },
    { value: 'MG', label: 'Minas Gerais' },
    { value: 'RS', label: 'Rio Grande do Sul' },
    { value: 'PR', label: 'Paraná' },
    { value: 'SC', label: 'Santa Catarina' },
  ];
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Imóveis</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Pesquisar imóveis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterState} onValueChange={setFilterState}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {states.map((state) => (
                <SelectItem key={state.value} value={state.value}>
                  {state.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.length > 0 ? (
          filteredProperties.map((property) => (
            <Card key={property.id} className="h-full hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Home className="h-4 w-4 mr-2 text-primary" />
                  {property.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm">{property.address}</p>
                      <p className="text-sm text-muted-foreground">
                        {property.city}, {property.state}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tipo:</span>
                    <span>{property.type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Área:</span>
                    <span>{property.area} m²</span>
                  </div>
                  <Button variant="outline" className="w-full mt-2">
                    Ver detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-muted-foreground">Nenhum imóvel encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
