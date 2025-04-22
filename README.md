# SISCOP - Sistema de Controle de Processos

## Visão Geral

SISCOP é um sistema de gerenciamento de documentos imobiliários e controle de processos desenvolvido com Next.js e Tailwind CSS. O sistema permite o gerenciamento de clientes, unidades, serviços, conformidades e tarefas relacionadas ao setor imobiliário.

## Tecnologias Utilizadas

- **Next.js 15**: Framework React para desenvolvimento web
- **Tailwind CSS**: Framework de CSS utilitário
- **TypeScript**: Superset tipado de JavaScript
- **Drizzle ORM**: ORM para acesso ao banco de dados
- **Radix UI**: Componentes de interface acessíveis e sem estilo
- **React Query**: Biblioteca para gerenciamento de estado e cache de dados

## Estrutura do Projeto

```
/app                    # Diretório principal do Next.js App Router
  /auth                 # Páginas de autenticação
  /components           # Componentes reutilizáveis
  /dashboard            # Páginas do dashboard
  /documents            # Páginas de documentos
  /hooks                # Hooks personalizados
  /lib                  # Utilitários, tipos e constantes
  /process-control      # Páginas de controle de processos
  /properties           # Páginas de imóveis
  /settings             # Páginas de configurações
/attached_assets        # Arquivos e componentes específicos
/server                 # Código do servidor Express
/shared                 # Código compartilhado entre cliente e servidor
```

## Configuração de Ambiente

O projeto utiliza variáveis de ambiente para configuração. Crie um arquivo `.env.local` com base no `.env` existente:

```
# API URLs
NEXT_PUBLIC_API_BASE_URL=https://amenirealestate.com.br:5601
NEXT_PUBLIC_API_AUTH_URL=https://amenirealestate.com.br:5601/login
NEXT_PUBLIC_API_ME_URL=https://amenirealestate.com.br:5601/user/me
NEXT_PUBLIC_API_CLIENTES_URL=https://amenirealestate.com.br:5601/ger-clientes/clientes
NEXT_PUBLIC_API_UNIDADES_URL=https://amenirealestate.com.br:5601/ger-clientes/unidades
NEXT_PUBLIC_API_SERVICOS_URL=https://amenirealestate.com.br:5601/ger-clientes/servicos
NEXT_PUBLIC_API_CONFORMIDADE_URL=https://amenirealestate.com.br:5601/ger-clientes/conformidades
NEXT_PUBLIC_API_FOLLOWUP_URL=https://amenirealestate.com.br:5601/ger-clientes/tarefas

# API Keys e Secrets (nunca expor no código)
API_SECRET_KEY=sua-chave-secreta
```

## Instalação e Execução

1. Instale as dependências:
   ```
   npm install
   ```

2. Execute o servidor de desenvolvimento:
   ```
   npm run dev
   ```

3. Para executar apenas o servidor backend:
   ```
   npm run server
   ```

4. Para construir o projeto para produção:
   ```
   npm run build
   ```

5. Para iniciar o projeto em produção:
   ```
   npm run start
   ```

## Temas e Aparência

O sistema suporta temas claro e escuro, configuráveis pelo usuário. A configuração de tema é gerenciada pelo componente `ThemeProvider` usando a biblioteca `next-themes`.

## Autenticação

O sistema utiliza autenticação baseada em token JWT. O token é armazenado no localStorage e enviado em todas as requisições à API.

## Migração do Vite para Next.js

Este projeto foi migrado de Vite para Next.js, mantendo a compatibilidade com as APIs existentes e preservando a funcionalidade original. As principais mudanças incluem:

1. Migração do sistema de rotas do Wouter para o App Router do Next.js
2. Adaptação das variáveis de ambiente de `VITE_` para `NEXT_PUBLIC_`
3. Reorganização da estrutura de arquivos para seguir as convenções do Next.js
4. Implementação de Server Components e Client Components conforme necessário
5. Manutenção do suporte a temas claro e escuro

## Licença

MIT
