import './globals.css';
import { Providers } from './providers';
import { cn } from './lib/utils';
import { Toaster } from './components/ui/toaster';
import React from 'react';

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <title>Siscop - Sistema de Controle de Processos</title>
        <meta name="description" content="Sistema de gerenciamento de documentos imobiliários" />
      </head>
      <body className={cn('min-h-screen bg-black font-sans antialiased text-white')}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}