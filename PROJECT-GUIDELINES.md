# Diretrizes do Projeto SISCOP

## Requisitos Fundamentais

1. **Arquitetura da Aplicação**
   - Esta é uma aplicação frontend que se comunica exclusivamente com APIs externas já existentes
   - Não deve haver banco de dados local nem mock data
   - Não utilizar server-side rendering ou SSR frameworks

2. **Autenticação e Gerenciamento de Dados**
   - Todas as requisições de dados devem ser feitas diretamente para as APIs existentes
   - Autenticação via JWT usando o endpoint de login, que retorna `access_token`
   - Usar o token para autenticar chamadas subsequentes via cabeçalho `Authorization: Bearer <token>`
   - Armazenar o token e dados do usuário logado no localStorage

3. **Principais Endpoints da API**
   - `VITE_NEXT_PUBLIC_API_AUTH_URL`: Autenticação (login)
   - `VITE_NEXT_PUBLIC_API_ME_URL`: Dados do usuário logado
   - `VITE_NEXT_PUBLIC_API_CLIENTES_URL`: Lista de clientes (requer parâmetro `codCoor` do usuário logado)
   - `VITE_NEXT_PUBLIC_API_UNIDADES_URL`: Unidades por cliente e UF
   - `VITE_NEXT_PUBLIC_API_SERVICOS_URL`: Serviços
   - `VITE_NEXT_PUBLIC_API_CONFORMIDADE_URL`: Documentos de conformidade

4. **Otimizações**
   - Implementar cache no localStorage para requisições frequentes
   - Usar proxy CORS quando necessário para contornar problemas de CORS
   - Implementar retry e timeout para chamadas à API quando necessário

5. **UI/UX**
   - Tema escuro em toda a aplicação
   - Design responsivo para mobile e desktop
   - Upload de documentos com drag-and-drop
   - Validação de arquivos (PDF, JPEG, PNG)
   - Limite de 10MB por arquivo e máximo de 5 arquivos

## Fluxo de Autenticação e Acesso

1. Usuário faz login com email e senha
2. API retorna `access_token` que é armazenado no localStorage
3. Requisições subsequentes usam este token no cabeçalho Authorization
4. Para consultar clientes, sempre usar o parâmetro `codCoor` que é o `cod` do usuário logado
5. Permissões e acesso são controlados pelo backend, frontend apenas exibe ou oculta elementos

## Stack Técnico

- React como framework principal
- TailwindCSS para estilização
- ShadCN UI para componentes
- React Query para gerenciamento de chamadas à API
- PrimeReact como biblioteca adicional de componentes
- localStorage para cache e armazenamento de tokens

## Endpoints Específicos

### Endpoint de Clientes
- URL: `https://amenirealestate.com.br:5601/ger-clientes/clientes`
- Método: GET
- Parâmetro obrigatório: `codCoor` (deve ser o código do usuário logado)
- Exemplo: `https://amenirealestate.com.br:5601/ger-clientes/clientes?codCoor=110`

### Endpoint de Unidades
- URL: `https://amenirealestate.com.br:5601/ger-clientes/unidades`
- Método: GET
- Parâmetros: `codcli` (código do cliente), `uf` (estado)
- Paginação: `pagina` e `quantidade`
- Exemplo: `https://amenirealestate.com.br:5601/ger-clientes/unidades?codcli=123&uf=SP&pagina=1&quantidade=100`

## Implementação Específica de Clientes
- O dropdown de clientes deve ser populado com dados da API via endpoint `VITE_NEXT_PUBLIC_API_CLIENTES_URL`
- Utilizar o `codCoor` (código do coordenador) do usuário logado como parâmetro para esta requisição
- Implementar cache para reduzir o número de requisições frequentes