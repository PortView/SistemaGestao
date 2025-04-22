# Comandos Úteis para o Projeto

Este documento contém comandos úteis para gerenciar o projeto Next.js e evitar problemas.

## Comandos Básicos

```bash
# Iniciar o servidor de desenvolvimento
npm run dev

# Construir para produção
npm run build

# Iniciar em modo de produção
npm start

# Limpar o cache do Next.js (útil para resolver problemas)
npx rimraf .next
```

## Comandos de Verificação e Backup

```bash
# Verificar a integridade da migração
node verificar-migracao.js

# Fazer backup dos arquivos essenciais
node backup-migracao.js
# ou simplesmente execute:
fazer-backup.bat
```

## Solução de Problemas Comuns

### Erro de porta em uso

Se a porta 3000 estiver em uso, você pode especificar outra porta:

```bash
npm run dev -- -p 3001
```

### Erros de hidratação

Se ocorrerem erros de hidratação, tente:

```bash
# Limpar o cache
npx rimraf .next

# Reiniciar o servidor com a opção de ignorar erros de hidratação
npm run dev
```

### Problemas com módulos

Se houver problemas com módulos:

```bash
# Reinstalar os módulos
npm ci

# Ou, se necessário, limpar o cache do npm
npm cache clean --force
npm install
```

### Problemas com variáveis de ambiente

Se as variáveis de ambiente não estiverem funcionando:

1. Verifique se o arquivo `.env` está na raiz do projeto
2. Verifique se as variáveis começam com `NEXT_PUBLIC_` para serem acessíveis no cliente
3. Reinicie o servidor após alterar o arquivo `.env`

## Comandos para Backup Manual

Se precisar fazer backup manual dos arquivos essenciais:

```bash
# Windows (PowerShell)
mkdir backup-manual
copy next.config.js backup-manual
copy .env backup-manual
copy MIGRACAO.md backup-manual
copy -r pages backup-manual
copy -r client/src/lib backup-manual/client-lib
```
