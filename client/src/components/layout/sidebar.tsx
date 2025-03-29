import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  FileText, 
  Building2, 
  Bell, 
  Settings, 
  FileCheck, 
  FileClock,
  FileWarning,
  FileX,
  LogOut
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar = ({ isMobile = false, isOpen = false, onClose }: SidebarProps) => {
  const [location] = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  
  const { data: user } = useQuery<User>({
    queryKey: ["/api/me"],
  });
  
  const { data: notifications } = useQuery({
    queryKey: ["/api/notifications", { read: false }],
    refetchInterval: 30000, // Recheck every 30 seconds
  });
  
  useEffect(() => {
    if (notifications?.data) {
      setUnreadCount(notifications.data.length);
    }
  }, [notifications]);

  const mainNavItems = [
    { href: "/", label: "Dashboard", icon: <Home className="h-5 w-5" /> },
    { href: "/documentos", label: "Documentos", icon: <FileText className="h-5 w-5" /> },
    { href: "/propriedades", label: "Propriedades", icon: <Building2 className="h-5 w-5" /> },
    { 
      href: "/notificacoes", 
      label: "Notificações", 
      icon: <Bell className="h-5 w-5" />,
      badge: unreadCount > 0 ? unreadCount : undefined 
    },
    { href: "/configuracoes", label: "Configurações", icon: <Settings className="h-5 w-5" /> },
  ];

  const documentTypes = [
    { href: "/documentos?type=1", label: "Licença de Funcionamento" },
    { href: "/documentos?type=2", label: "Habite-se" },
    { href: "/documentos?type=3", label: "Escritura" },
    { href: "/documentos?type=4", label: "IPTU" },
    { href: "/documentos?type=5", label: "Matrícula" },
  ];

  const sidebarClasses = cn(
    "bg-white border-r border-gray-200 flex-shrink-0 flex flex-col h-full",
    isMobile ? "w-full max-w-xs" : "w-64"
  );

  return (
    <div className={sidebarClasses}>
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <h1 className="text-xl font-bold text-primary">DocImob</h1>
      </div>
      
      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-2">
          {mainNavItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>
                <a 
                  className={cn(
                    "flex items-center p-2 text-base font-medium rounded-lg",
                    location === item.href 
                      ? "text-primary bg-blue-50" 
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                  onClick={isMobile ? onClose : undefined}
                >
                  <span className="w-6 text-center">{item.icon}</span>
                  <span className="ml-3">{item.label}</span>
                  {item.badge && (
                    <Badge variant="destructive" className="ml-auto w-5 h-5 flex items-center justify-center p-0">
                      {item.badge}
                    </Badge>
                  )}
                </a>
              </Link>
            </li>
          ))}
        </ul>
        
        <div className="pt-4 mt-4 border-t border-gray-200">
          <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipos de Documentos</h3>
          <ul className="mt-2 space-y-1">
            {documentTypes.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>
                  <a 
                    className="flex items-center p-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
                    onClick={isMobile ? onClose : undefined}
                  >
                    <span className="ml-2">{item.label}</span>
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      
      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <Avatar>
            <AvatarImage src={user?.avatarUrl || ''} alt={user?.name || 'Usuário'} />
            <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">{user?.name || 'Carregando...'}</p>
            <p className="text-xs font-medium text-gray-500">{user?.role || ''}</p>
          </div>
          <Button variant="ghost" size="icon" className="ml-auto rounded-full text-gray-400 hover:text-gray-500">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
