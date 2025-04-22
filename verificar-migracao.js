/**
 * Script para verificar a integridade da migração de Vite para Next.js
 * Executa uma série de testes para garantir que todos os arquivos necessários estão presentes
 * e configurados corretamente.
 */

const fs = require('fs');
const path = require('path');

console.log('Iniciando verificação da migração Vite para Next.js...\n');

// Arquivos essenciais que devem existir
const arquivosEssenciais = [
  'next.config.js',
  'pages/_app.tsx',
  'pages/_document.tsx',
  'pages/index.tsx',
  'pages/login.tsx',
  'pages/dashboard.tsx',
  'client/src/lib/env.ts',
  '.env'
];

// Componentes que foram atualizados
const componentesAtualizados = [
  'client/src/lib/api-service.ts',
  'client/src/components/auth/login-form.tsx',
  'client/src/hooks/use-auth.tsx',
  'client/src/components/process/table-servicos.tsx',
  'client/src/components/process/table-followup.tsx',
  'client/src/components/process/table-conform.tsx',
  'client/src/components/verification-dialog.tsx'
];

// Verificar arquivos essenciais
console.log('Verificando arquivos essenciais...');
let todosArquivosEssenciaisExistem = true;
for (const arquivo of arquivosEssenciais) {
  const caminhoCompleto = path.join(__dirname, arquivo);
  const existe = fs.existsSync(caminhoCompleto);
  console.log(`${existe ? '✅' : '❌'} ${arquivo}`);
  if (!existe) {
    todosArquivosEssenciaisExistem = false;
  }
}

// Verificar componentes atualizados
console.log('\nVerificando componentes atualizados...');
let todosComponentesAtualizadosExistem = true;
for (const componente of componentesAtualizados) {
  const caminhoCompleto = path.join(__dirname, componente);
  const existe = fs.existsSync(caminhoCompleto);
  console.log(`${existe ? '✅' : '❌'} ${componente}`);
  if (!existe) {
    todosComponentesAtualizadosExistem = false;
  }
}

// Verificar se env.ts contém as variáveis necessárias
console.log('\nVerificando conteúdo do arquivo env.ts...');
const envPath = path.join(__dirname, 'client/src/lib/env.ts');
let envConteudoValido = false;
if (fs.existsSync(envPath)) {
  const conteudo = fs.readFileSync(envPath, 'utf8');
  const variaveisNecessarias = [
    'API_BASE_URL',
    'API_AUTH_URL',
    'API_ME_URL',
    'API_CLIENTES_URL',
    'CACHE_EXPIRATION',
    'LOCAL_STORAGE_TOKEN_KEY'
  ];
  
  let todasVariaveisPresentes = true;
  for (const variavel of variaveisNecessarias) {
    if (!conteudo.includes(variavel)) {
      console.log(`❌ Variável ${variavel} não encontrada em env.ts`);
      todasVariaveisPresentes = false;
    }
  }
  
  if (todasVariaveisPresentes) {
    console.log('✅ Todas as variáveis necessárias estão presentes em env.ts');
    envConteudoValido = true;
  }
} else {
  console.log('❌ Arquivo env.ts não encontrado');
}

// Verificar se .env contém as variáveis necessárias
console.log('\nVerificando conteúdo do arquivo .env...');
const dotenvPath = path.join(__dirname, '.env');
let dotenvConteudoValido = false;
if (fs.existsSync(dotenvPath)) {
  const conteudo = fs.readFileSync(dotenvPath, 'utf8');
  const variaveisNecessarias = [
    'NEXT_PUBLIC_API_BASE_URL',
    'NEXT_PUBLIC_API_AUTH_URL',
    'NEXT_PUBLIC_API_ME_URL',
    'NEXT_PUBLIC_CACHE_SHORT'
  ];
  
  let todasVariaveisPresentes = true;
  for (const variavel of variaveisNecessarias) {
    if (!conteudo.includes(variavel)) {
      console.log(`❌ Variável ${variavel} não encontrada em .env`);
      todasVariaveisPresentes = false;
    }
  }
  
  if (todasVariaveisPresentes) {
    console.log('✅ Todas as variáveis necessárias estão presentes em .env');
    dotenvConteudoValido = true;
  }
} else {
  console.log('❌ Arquivo .env não encontrado');
}

// Resultado final
console.log('\n=== RESULTADO DA VERIFICAÇÃO ===');
if (todosArquivosEssenciaisExistem && todosComponentesAtualizadosExistem && envConteudoValido && dotenvConteudoValido) {
  console.log('✅ Migração completa e íntegra! Todos os arquivos e configurações necessários estão presentes.');
} else {
  console.log('⚠️ Migração incompleta ou com problemas. Verifique os itens marcados com ❌ acima.');
}
