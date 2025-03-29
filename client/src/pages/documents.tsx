import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import DocumentsList from "@/components/documents/document-list";
import { Link } from "wouter";

export default function Documents() {
  return (
    <div className="flex-1 relative pb-8 z-0 overflow-y-auto">
      {/* Page header */}
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
          <div className="py-6 md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">Documentos</h2>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <Link href="/documentos/novo">
                <Button>
                  <Plus className="-ml-1 mr-2 h-4 w-4" />
                  Novo Documento
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <DocumentsList showFilters={true} />
        </div>
      </div>
    </div>
  );
}
