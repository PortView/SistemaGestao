'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '../../components/auth/login-form';
import { useAuth } from '../../hooks/use-auth';
import Image from 'next/image';

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  // Redirecionar para o dashboard se o usuário já estiver autenticado
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);
  
  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex flex-col justify-center flex-1 px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="w-full max-w-sm lg:w-96 mx-auto">
          <LoginForm />
        </div>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-bl from-black/70 to-background">
          <div className="relative w-full max-w-lg text-center px-4">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-6">
              Sistema de Controle de Processos
            </h2>
            <p className="text-lg text-white/80 mb-8">
              Gerencie documentos imobiliários e mantenha-se atualizado sobre seus processos com uma experiência moderna e eficiente.
            </p>
            <div className="flex justify-center space-x-4">
              <div className="bg-card/20 backdrop-blur rounded-lg p-4 border border-white/10">
                <p className="text-white font-semibold">Documentação Organizada</p>
                <p className="text-white/70 text-sm">Visualize, adicione e gerencie documentos facilmente</p>
              </div>
              <div className="bg-card/20 backdrop-blur rounded-lg p-4 border border-white/10">
                <p className="text-white font-semibold">Acompanhamento em Tempo Real</p>
                <p className="text-white/70 text-sm">Monitore prazos e conformidades com alertas automáticos</p>
              </div>
            </div>
          </div>
        </div>
        {/* Imagem de fundo - pode ser substituída por uma imagem do projeto */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-purple-900/30" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
          <div className="h-full w-full bg-[url('/images/auth-background.jpg')] bg-cover opacity-60" />
        </div>
      </div>
    </div>
  );
}