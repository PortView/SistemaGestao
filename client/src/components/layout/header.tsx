import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, Sun, Moon, LogOut, ChevronDown, User } from "lucide-react";
import { useTheme } from "next-themes";
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
  const { theme, setTheme } = useTheme();
  const siscopUser = user as SiscopUser;
  const [activeMenu, setActiveMenu] = useState("");

  // Fetch unread notifications
  const { data: notifications } = useQuery<any>({
    queryKey: ["/api/notifications", { read: false }],
    refetchInterval: 30000,
  });

  const unreadCount = notifications && notifications.data && Array.isArray(notifications.data) 
    ? notifications.data.length 
    : 0;

  // Função de alternância de tema já implementada com next-themes

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
        "Prod. / Faturamento",
        "Verificação"
      ]
    }
  ];

  return (
    <header className="h-16 px-4 flex items-center justify-between border-b dark:border-gray-700 border-gray-500 bg-zinc-400 dark:bg-zinc-700 text-black dark:text-white fixed w-full z-50">
      <div className="flex items-center">
        <span 
          className="text-2xl font-bold text-black dark:text-white mr-8 mb-2 cursor-pointer" 
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
                    "text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-none",
                    (activeMenu === menu.name || (menu.name === "Gerência" && location === "/controle-processos")) && 
                      "bg-blue-600 dark:bg-amber-800 text-white"
                  )}
                >
                  {menu.name}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white dark:bg-gray-700 text-black dark:text-white border-gray-200 dark:border-gray-800 w-56 rounded-none">
                {menu.items.map((item) => (
                  <DropdownMenuItem 
                    key={item}
                    asChild
                    onClick={() => {
                      if (item === "Verificação") {
                        const event = new CustomEvent('open-verification');
                        window.dispatchEvent(event);
                      } else if (item === "Controle de Processos") {
                        setLocation("/controle-processos");
                      }
                    }}
                  >
                    <div 
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 w-full text-black dark:text-white px-4 py-2"
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
            <p className="text-sm font-medium text-black dark:text-white">
              {localStorage.getItem('user_name') || 'Carregando...'}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {localStorage.getItem('user_tipo') || 'Analista'}
            </p>
          </div>

          <Avatar className="h-8 w-8 mr-2">
            <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white">
              {(localStorage.getItem('user_name') || 'U')[0]}
            </AvatarFallback>
          </Avatar>

          <Button
            variant="ghost"
            size="icon"
            className="text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 mr-2"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
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