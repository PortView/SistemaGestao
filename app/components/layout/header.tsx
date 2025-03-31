'use client';

import React, { useState } from 'react';
import { useAuth } from '../../hooks/use-auth';
import { BellIcon, LogOut, MenuIcon, Settings, UserIcon } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    window.location.href = '/auth/login';
  };
  
  return (
    <header className="bg-card border-b w-full p-4 flex items-center justify-between">
      <div className="flex items-center">
        <button
          type="button"
          onClick={onMenuClick}
          className="bg-transparent md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground"
        >
          <MenuIcon className="h-6 w-6" />
        </button>
        
        <span className="text-xl font-bold ml-2 md:ml-0">SISCOP</span>
      </div>
      
      <div className="flex items-center gap-4">
        <Link href="/notifications" className="text-muted-foreground hover:text-foreground">
          <BellIcon className="h-5 w-5" />
        </Link>
        
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 hover:text-foreground focus:outline-none"
          >
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white uppercase">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="hidden md:block text-sm text-left">
              <p className="font-medium">{user?.name || 'Usuário'}</p>
              <p className="text-xs text-muted-foreground">
                {user?.tipo === 'ADM' ? 'Administrador' : 
                 user?.tipo === 'TEC' ? 'Técnico' : 
                 user?.tipo === 'COR' ? 'Coordenador' : 'Usuário'}
              </p>
            </div>
          </button>
          
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-card border py-1 z-10">
              <Link 
                href="/settings"
                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent"
                onClick={() => setDropdownOpen(false)}
              >
                <Settings className="h-4 w-4" />
                Configurações
              </Link>
              <Link 
                href="/profile"
                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent"
                onClick={() => setDropdownOpen(false)}
              >
                <UserIcon className="h-4 w-4" />
                Perfil
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-accent w-full text-left"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}