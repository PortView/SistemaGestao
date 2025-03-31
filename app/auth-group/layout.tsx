'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex h-screen w-full flex-col md:flex-row bg-black text-white">
      {/* Lado esquerdo - Formulário */}
      <div className="w-full md:w-1/2 p-6 md:p-10 flex items-center justify-center">
        <div className="w-full max-w-md space-y-8">
          {children}
        </div>
      </div>

      {/* Lado direito - Hero Section */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-900 to-black p-10 flex-col justify-between">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-6">SISCOP</h1>
          <h2 className="text-2xl font-semibold text-blue-400">Sistema de Controle de Processos</h2>
        </div>
        
        <div className="space-y-6">
          <h3 className="text-xl font-medium">Gerencie documentos imobiliários com eficiência</h3>
          <ul className="space-y-3">
            <li className="flex items-center">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3">✓</div>
              <span>Controle de licenças e documentações</span>
            </li>
            <li className="flex items-center">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3">✓</div>
              <span>Gestão de processos e conformidades</span>
            </li>
            <li className="flex items-center">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3">✓</div>
              <span>Alertas automáticos para vencimentos</span>
            </li>
            <li className="flex items-center">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3">✓</div>
              <span>Relatórios personalizados</span>
            </li>
          </ul>
        </div>
        
        <div className="mt-10">
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} SISCOP. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
}