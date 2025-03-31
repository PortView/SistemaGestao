'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

// Schema de validação de login
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'A senha é obrigatória'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  
  // Form com react-hook-form e validação zod
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: process.env.VITE_TEST_USER_EMAIL || '',
      password: process.env.VITE_TEST_USER_PASSWORD || '',
    },
  });
  
  // Função para submeter o formulário
  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    setError(null);
    
    try {
      // Desativa verificação SSL para APIs que usam certificados auto-assinados
      const httpsAgent = new (require('https').Agent)({
        rejectUnauthorized: false
      });
      
      // Faz a requisição de login
      const response = await fetch(process.env.VITE_NEXT_PUBLIC_API_AUTH_URL || '', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
        agent: httpsAgent,
      });
      
      if (!response.ok) {
        throw new Error('Credenciais inválidas');
      }
      
      const responseData = await response.json();
      
      // Verifica se temos o token na resposta
      if (!responseData.access_token) {
        throw new Error('Token de acesso não encontrado na resposta');
      }
      
      // Salva o token e busca os dados do usuário
      await login(responseData.access_token);
      
      // Chama o callback de sucesso
      onSuccess();
    } catch (err) {
      console.error('Erro de login:', err);
      setError(err instanceof Error ? err.message : 'Ocorreu um erro durante o login');
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <div className="space-y-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...form.register('email')}
            className="flex h-10 w-full rounded-md border bg-card px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Seu email de acesso"
            disabled={isLoading}
          />
          {form.formState.errors.email && (
            <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none" htmlFor="password">
            Senha
          </label>
          <input
            id="password"
            type="password"
            {...form.register('password')}
            className="flex h-10 w-full rounded-md border bg-card px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Sua senha"
            disabled={isLoading}
          />
          {form.formState.errors.password && (
            <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
          )}
        </div>
        
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-900 dark:bg-red-900/20 dark:text-red-200">
            {error}
          </div>
        )}
        
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Entrando...
            </>
          ) : (
            'Entrar'
          )}
        </button>
      </form>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Ou
          </span>
        </div>
      </div>
      
      <div className="mt-4 text-center text-sm">
        <p className="text-muted-foreground">
          Esqueceu sua senha? Entre em contato com o administrador do sistema.
        </p>
      </div>
    </div>
  );
}