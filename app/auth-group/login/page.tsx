'use client';

import { LoginForm } from '@/components/auth/login-form';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  
  const handleLoginSuccess = () => {
    router.push('/dashboard');
  };
  
  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Bem-vindo ao SISCOP</h1>
        <p className="text-muted-foreground mt-2">
          Faça login para acessar o sistema
        </p>
      </div>
      
      <LoginForm onSuccess={handleLoginSuccess} />
    </>
  );
}