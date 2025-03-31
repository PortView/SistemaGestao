'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirecionar para a página de login
    router.push('/auth/login');
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="animate-pulse text-center">
        <h1 className="text-2xl font-bold">Carregando SISCOP...</h1>
        <p className="mt-4 text-muted-foreground">Sistema de Controle de Processos</p>
      </div>
    </main>
  );
}