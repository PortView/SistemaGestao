/**
 * Script para fazer backup dos arquivos essenciais da migração
 * Cria uma pasta de backup com data e hora e copia todos os arquivos importantes
 */

const fs = require('fs');
const path = require('path');

// Obter data e hora atual para o nome da pasta de backup
const agora = new Date();
const dataFormatada = agora.toISOString().replace(/:/g, '-').replace(/\..+/, '');
const nomePastaBackup = `backup-migracao-${dataFormatada}`;
const pastaBackupPath = path.join(__dirname, nomePastaBackup);

// Criar pasta de backup
if (!fs.existsSync(pastaBackupPath)) {
  fs.mkdirSync(pastaBackupPath);
  fs.mkdirSync(path.join(pastaBackupPath, 'pages'));
  fs.mkdirSync(path.join(pastaBackupPath, 'client'));
  fs.mkdirSync(path.join(pastaBackupPath, 'client/src'));
  fs.mkdirSync(path.join(pastaBackupPath, 'client/src/lib'));
  fs.mkdirSync(path.join(pastaBackupPath, 'client/src/components'));
  fs.mkdirSync(path.join(pastaBackupPath, 'client/src/components/auth'));
  fs.mkdirSync(path.join(pastaBackupPath, 'client/src/components/process'));
  fs.mkdirSync(path.join(pastaBackupPath, 'client/src/hooks'));
}

console.log(`Criando backup na pasta: ${nomePastaBackup}`);

// Lista de arquivos para backup
const arquivosParaBackup = [
  'next.config.js',
  '.env',
  'MIGRACAO.md',
  'pages/_app.tsx',
  'pages/_document.tsx',
  'pages/index.tsx',
  'pages/login.tsx',
  'pages/dashboard.tsx',
  'client/src/lib/env.ts',
  'client/src/lib/api-service.ts',
  'client/src/components/auth/login-form.tsx',
  'client/src/hooks/use-auth.tsx',
  'client/src/components/process/table-servicos.tsx',
  'client/src/components/process/table-followup.tsx',
  'client/src/components/process/table-conform.tsx',
  'client/src/components/verification-dialog.tsx'
];

// Copiar cada arquivo para a pasta de backup
let sucessos = 0;
let falhas = 0;

for (const arquivo of arquivosParaBackup) {
  const origem = path.join(__dirname, arquivo);
  const destino = path.join(pastaBackupPath, arquivo);
  
  try {
    if (fs.existsSync(origem)) {
      // Garantir que a pasta de destino existe
      const pastaPai = path.dirname(destino);
      if (!fs.existsSync(pastaPai)) {
        fs.mkdirSync(pastaPai, { recursive: true });
      }
      
      // Copiar o arquivo
      fs.copyFileSync(origem, destino);
      console.log(`✅ Backup de ${arquivo} concluído`);
      sucessos++;
    } else {
      console.log(`⚠️ Arquivo ${arquivo} não encontrado, pulando...`);
      falhas++;
    }
  } catch (error) {
    console.error(`❌ Erro ao fazer backup de ${arquivo}: ${error.message}`);
    falhas++;
  }
}

// Criar um arquivo de resumo do backup
const resumoPath = path.join(pastaBackupPath, 'RESUMO.txt');
const conteudoResumo = `Backup da migração Vite para Next.js
Data e hora: ${agora.toLocaleString()}
Total de arquivos: ${arquivosParaBackup.length}
Sucessos: ${sucessos}
Falhas: ${falhas}

Arquivos incluídos:
${arquivosParaBackup.join('\n')}
`;

fs.writeFileSync(resumoPath, conteudoResumo);

console.log('\n=== RESUMO DO BACKUP ===');
console.log(`Total de arquivos: ${arquivosParaBackup.length}`);
console.log(`Arquivos copiados com sucesso: ${sucessos}`);
console.log(`Falhas: ${falhas}`);
console.log(`Backup concluído em: ${pastaBackupPath}`);
console.log('Um arquivo RESUMO.txt foi criado na pasta de backup com os detalhes');

// Criar um arquivo .bat para executar o backup facilmente
const batFilePath = path.join(__dirname, 'fazer-backup.bat');
const batConteudo = `@echo off
echo Iniciando backup dos arquivos da migracao...
node backup-migracao.js
pause
`;

fs.writeFileSync(batFilePath, batConteudo);
console.log('\nUm arquivo fazer-backup.bat foi criado para facilitar a execução do backup no futuro.');
