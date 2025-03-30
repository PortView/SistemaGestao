import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

// Esquema de validação do formulário de login
const loginSchema = z.object({
  email: z.string().email("Digite um e-mail válido"),
  password: z.string().min(4, "A senha deve ter pelo menos 4 caracteres"),
});

// Tipo inferido do esquema de validação
type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { login } = useAuth();
  
  // Inicializa o formulário com o esquema de validação
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Mutação para fazer login
  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormValues) => {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao fazer login");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      if (data?.access_token) {
        // Salva o token de acesso
        login(data.access_token);
        
        // Salva dados do usuário para exibição no header
        if (data.user) {
          localStorage.setItem('user_name', data.user.name || '');
          localStorage.setItem('user_tipo', data.user.tipo || '');
          localStorage.setItem('user_cod', data.user.cod?.toString() || '');
          localStorage.setItem('user_email', data.user.email || '');
          localStorage.setItem('user_mvvm', data.user.mvvm || '');
        }
        
        toast({
          title: "Login realizado com sucesso",
          description: "Você será redirecionado para o dashboard",
        });
        
        // Callback de sucesso
        onSuccess();
      }
    },
    onError: (error: any) => {
      console.error("Erro no login:", error);
      toast({
        title: "Erro ao fazer login",
        description: error?.message || "Verifique suas credenciais e tente novamente",
        variant: "destructive",
      });
    },
  });

  // Handler de submissão do formulário
  function onSubmit(data: LoginFormValues) {
    loginMutation.mutate(data);
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-gray-800 border-gray-700 shadow-xl text-white">
      <CardHeader>
        <CardTitle className="text-2xl text-white">Login</CardTitle>
        <CardDescription className="text-gray-300">
          Entre com suas credenciais para acessar o sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">E-mail</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="seu.email@exemplo.com" 
                      {...field} 
                      disabled={loginMutation.isPending}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Senha</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="******" 
                      {...field} 
                      disabled={loginMutation.isPending}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-gray-400">
        Sistema de Gerenciamento de Documentos Imobiliários
      </CardFooter>
    </Card>
  );
}