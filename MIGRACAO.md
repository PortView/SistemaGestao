# Roteiro de Migração Vite para Next.js

Este documento descreve o processo de migração do projeto de Vite para Next.js, incluindo os problemas encontrados e as soluções implementadas.

## Estrutura do Projeto

A migração manteve a estrutura original em `client/src/pages` e adicionou:
- Arquivos de configuração do Next.js
- Páginas de redirecionamento em `pages/`
- Componentes UI necessários

## Etapas Realizadas

### 1. Configuração Inicial
- Criação do arquivo `next.config.js` com aliases apontando para `client/src`
- Criação do `_app.tsx` para integrar o sistema de rotas Wouter com o Next.js
- Criação de páginas de redirecionamento em `pages/` para login e dashboard

### 2. Migração de Variáveis de Ambiente
- Substituição de `import.meta.env.VITE_*` por `process.env.NEXT_PUBLIC_*`
- Criação de um módulo centralizado `env.ts` com valores fixos
- Atualização do `.env` para incluir as variáveis de cache

### 3. Resolução de Erros de Hidratação
- Modificação do `_app.tsx` para usar o padrão de supressão de hidratação
- Atualização do `_document.tsx` para usar valores fixos nas variáveis expostas
- Atualização de todos os componentes para importar variáveis do módulo centralizado

### 4. Componentes Atualizados
- `login-form.tsx`
- `use-auth.tsx`
- `table-servicos.tsx`
- `table-followup.tsx`
- `table-conform.tsx`
- `verification-dialog.tsx`
- `api-service.ts`

## Problemas Resolvidos

1. **Erro de Variáveis de Ambiente**: Substituição do formato Vite pelo formato Next.js
2. **Erro de Redirecionamento**: Uso de `window.location.href` com timeout
3. **Conflito de Arquivos**: Remoção de arquivos conflitantes nas pastas `app` e `pages`
4. **Erros de Hidratação**: Implementação de estratégias de supressão e consistência entre servidor e cliente

## Próximos Passos

- Continuar testando todas as funcionalidades
- Verificar se há mais componentes que precisam ser ajustados
- Monitorar quaisquer erros durante a execução

## Comandos Úteis

```bash
# Iniciar o servidor de desenvolvimento
npm run dev

# Construir para produção
npm run build

# Iniciar em modo de produção
npm start
```
