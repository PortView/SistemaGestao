import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import DocumentsList from "@/components/documents/document-list";
import { Link } from "wouter";

export default function Documents() {
  return (
    <div className="flex-1 relative pb-8 z-0 overflow-y-auto bg-black text-white">
      {/* Page header */}
      <div className="bg-black shadow">
        <div className="px-4 sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
          <div className="py-6 md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-white sm:text-3xl sm:truncate">Documentos</h2>
            </div>
            <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
              <Link href="/documento/upload">
                <Button variant="outline" className="bg-transparent border-gray-600 text-white hover:bg-gray-800">
                  <Plus className="-ml-1 mr-2 h-4 w-4" />
                  Upload de Documentos
                </Button>
              </Link>
              <Link href="/documentos/novo">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="-ml-1 mr-2 h-4 w-4" />
                  Novo Documento
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <DocumentsList showFilters={true} />
        </div>
      </div>
    </div>
  );
}
