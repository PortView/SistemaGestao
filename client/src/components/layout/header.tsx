import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Menu, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  onOpenSidebar: () => void;
}

const Header = ({ onOpenSidebar }: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: notifications } = useQuery({
    queryKey: ["/api/notifications", { read: false }],
  });

  const unreadCount = notifications?.data?.length || 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/documentos?search=${encodeURIComponent(searchQuery)}`;
    } else {
      toast({
        title: "Pesquisa vazia",
        description: "Digite algo para pesquisar.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white border-b border-gray-200">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden px-4 text-gray-500"
        onClick={onOpenSidebar}
      >
        <span className="sr-only">Abrir menu</span>
        <Menu className="h-6 w-6" />
      </Button>
      
      <div className="flex-1 px-4 flex justify-between">
        <div className="flex-1 flex">
          <form onSubmit={handleSearch} className="w-full max-w-lg lg:max-w-xs">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="search"
                placeholder="Pesquisar documentos..."
                className="pl-10 pr-3"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        </div>
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="p-1 rounded-full text-gray-400 hover:text-gray-500 relative">
            <span className="sr-only">Ver notificações</span>
            <Bell className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Header;
