'use client';

import { useAuth } from '@/hooks/use-auth';

export default function DashboardPage() {
  const { user } = useAuth();
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo, {user?.name || 'Usuário'}! Aqui você pode gerenciar todos os aspectos do sistema.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Cards de Status irão aqui */}
        <div className="rounded-xl bg-card p-6">
          <h3 className="font-medium">Documentos</h3>
          <div className="mt-4 text-3xl font-bold">0</div>
        </div>
        
        <div className="rounded-xl bg-card p-6">
          <h3 className="font-medium">Pendentes</h3>
          <div className="mt-4 text-3xl font-bold text-yellow-600">0</div>
        </div>
        
        <div className="rounded-xl bg-card p-6">
          <h3 className="font-medium">Aprovados</h3>
          <div className="mt-4 text-3xl font-bold text-green-600">0</div>
        </div>
        
        <div className="rounded-xl bg-card p-6">
          <h3 className="font-medium">Vencidos</h3>
          <div className="mt-4 text-3xl font-bold text-red-600">0</div>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {/* Lista de documentos recentes irá aqui */}
        <div className="rounded-xl bg-card p-6">
          <h3 className="text-lg font-medium">Documentos Recentes</h3>
          <div className="mt-4">
            <p className="text-muted-foreground">Nenhum documento disponível.</p>
          </div>
        </div>
        
        {/* Lista de notificações irá aqui */}
        <div className="rounded-xl bg-card p-6">
          <h3 className="text-lg font-medium">Notificações</h3>
          <div className="mt-4">
            <p className="text-muted-foreground">Nenhuma notificação disponível.</p>
          </div>
        </div>
      </div>
    </div>
  );
}