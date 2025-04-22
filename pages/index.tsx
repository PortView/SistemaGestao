'use client';

import React, { useEffect } from 'react';

/**
 * Página inicial que redireciona para a rota /login
 * Isso garante que o sistema de rotas do Wouter seja usado
 */
export default function Home() {
  useEffect(() => {
    // Redirecionar para a página de login
    window.location.href = '/login';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">Carregando SISCOP...</h1>
        <p className="mt-4 text-gray-400">Sistema de Controle de Processos</p>
      </div>
    </div>
  );
}
