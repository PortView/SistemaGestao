import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, Sun, Moon, LogOut, ChevronDown, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SiscopUser } from "@/lib/types";

const Header = () => {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(true);
  // Cast para SiscopUser se necessário - se os dados vierem da API do Siscop
  const siscopUser = user as unknown as SiscopUser;
  const [activeMenu, setActiveMenu] = useState("");
  
  // Fetch unread notifications
  const { data: notifications } = useQuery<any>({
    queryKey: ["/api/notifications", { read: false }],
    refetchInterval: 30000,
  });
  
  const unreadCount = notifications && notifications.data && Array.isArray(notifications.data) 
    ? notifications.data.length 
    : 0;
  
  const toggleTheme = () => {
    // In a real implementation, you'd also need to update the document class or a theme context
    setIsDarkMode(!isDarkMode);
  };

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  // Menus do Siscop baseados nas imagens fornecidas
  const menus = [
    {
      name: "Administração",
      items: [
        "Atribuições",
        "Atribuições Receitas Cargo"
      ]
    },
    {
      name: "Cadastro",
      items: [
        "Clientes",
        "Imóveis",
        "Contratos"
      ]
    },
    {
      name: "Gerência",
      items: [
        "Controle de Processos",
        "Lib. Fatur. Gerência",
        "Lib. Fixa. Gerência",
        "Copia de Conf. p/ outro imóvel",
        "Copia de Conf. p/ vários imóveis"
      ]
    },
    {
      name: "Técnico",
      items: [
        "Analista"
      ]
    },
    {
      name: "Consultas",
      items: [
        "Aval Conformidade",
        "Planilhas dinâmicas",
        "Medição / Cliente",
        "Medição / Faturamento",
        "Pendências",
        "Emol. Pagos",
        "Faturamento Gerencia",
        "Prod. / Faturamento"
      ]
    }
  ];
  
  return (
    <header className="h-16 px-4 flex items-center justify-between border-b border-gray-700 bg-black text-white fixed w-full z-50">
      <div className="flex items-center">
        <span 
          className="text-xl font-bold text-white mr-8 cursor-pointer" 
          onClick={() => setLocation("/")}
        >
          Siscop
        </span>
        
        <nav className="flex">
          {menus.map((menu) => (
            <DropdownMenu key={menu.name} onOpenChange={(open) => open && setActiveMenu(menu.name)}>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "text-white hover:bg-gray-800 rounded-none",
                    (activeMenu === menu.name || (menu.name === "Gerência" && location === "/controle-processos")) && 
                      "bg-amber-800"
                  )}
                >
                  {menu.name}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-700 text-white border-gray-800 w-56 rounded-none">
                {menu.items.map((item) => (
                  <DropdownMenuItem key={item} asChild>
                    <div 
                      className="cursor-pointer hover:bg-gray-600 w-full text-white px-4 py-2"
                      onClick={() => {
                        if (item === "Controle de Processos") {
                          setLocation("/controle-processos");
                        }
                      }}
                    >
                      {item}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
        </nav>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="flex items-center mr-4">
          <div className="mr-4 text-right">
            <p className="text-sm font-medium text-white">
              {localStorage.getItem('user_name') || 'Carregando...'}
            </p>
            <p className="text-xs text-gray-400">
              {localStorage.getItem('user_tipo') || 'Analista'}
            </p>
          </div>
          
          <Avatar className="h-8 w-8 mr-2">
            <AvatarFallback className="bg-gray-700">
              {localStorage.getItem('user_name')?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-gray-800"
            onClick={handleLogout}
            title="Sair do sistema"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
