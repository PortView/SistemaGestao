'use client';

import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { 
  BarChart, 
  FileText, 
  Home, 
  Layers, 
  Settings, 
  Users, 
  X 
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isMobile = false, isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  
  // Determina o tipo de acesso com base no tipo de usuário
  const isAdmin = user?.tipo === 'ADM';
  const isTecnico = user?.tipo === 'TEC';
  const isCoordenador = user?.tipo === 'COR';
  
  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transition-transform duration-300 transform',
        isMobile && !isOpen && '-translate-x-full',
        isMobile && isOpen && 'translate-x-0',
        !isMobile && 'relative translate-x-0 w-64 shrink-0 hidden md:block'
      )}
    >
      {isMobile && (
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-6 w-6" />
        </button>
      )}
      
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center text-white">
            S
          </div>
          <h1 className="text-xl font-bold">SISCOP</h1>
        </div>
        
        <nav className="space-y-1">
          <NavItem href="/dashboard" icon={Home} active={pathname === '/dashboard'}>
            Dashboard
          </NavItem>
          
          <NavItem href="/process-control" icon={Layers} active={pathname === '/process-control'}>
            Controle de Processos
          </NavItem>
          
          <NavItem href="/documents" icon={FileText} active={pathname === '/documents'}>
            Documentos
          </NavItem>
          
          <NavItem href="/properties" icon={BarChart} active={pathname === '/properties'}>
            Imóveis
          </NavItem>
          
          {(isAdmin || isCoordenador) && (
            <NavItem href="/users" icon={Users} active={pathname === '/users'}>
              Usuários
            </NavItem>
          )}
          
          <NavItem href="/settings" icon={Settings} active={pathname === '/settings'}>
            Configurações
          </NavItem>
        </nav>
      </div>
    </aside>
  );
}

interface NavItemProps {
  href: string;
  icon: React.FC<{ className?: string }>;
  active?: boolean;
  children: React.ReactNode;
}

function NavItem({ href, icon: Icon, active, children }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'hover:bg-accent hover:text-accent-foreground'
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{children}</span>
    </Link>
  );
}