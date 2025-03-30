import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, Sun, Moon, LogOut, ChevronDown } from "lucide-react";
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

const Header = () => {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(true);
  
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
  
  return (
    <header className="h-16 px-4 flex items-center justify-between border-b border-gray-700 bg-black text-white fixed w-full z-50">
      <div className="flex items-center">
        <span 
          className="text-xl font-bold text-white mr-8 cursor-pointer" 
          onClick={() => setLocation("/")}
        >
          DocImob
        </span>
        
        <nav className="flex space-x-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className={cn(
                  "text-white hover:bg-gray-800",
                  location === "/controle-processos" && "bg-gray-800"
                )}
              >
                Gerência <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-900 text-white border-gray-700">
              <DropdownMenuItem asChild>
                <div 
                  className="cursor-pointer hover:bg-gray-800 w-full"
                  onClick={() => setLocation("/controle-processos")}
                >
                  Controle de Processos
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative text-white hover:bg-gray-800"
          onClick={() => setLocation("/notificacoes")}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0">
              {unreadCount}
            </Badge>
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-white hover:bg-gray-800"
        >
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        
        <div className="flex items-center ml-4">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatarUrl || ''} alt={user?.name || 'Usuário'} />
            <AvatarFallback className="bg-gray-700">{user?.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          
          <div className="ml-2 mr-4 hidden md:block">
            <p className="text-sm font-medium text-white">{user?.name || 'Carregando...'}</p>
            <p className="text-xs text-gray-400">{user?.role || ''}</p>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-gray-800"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
