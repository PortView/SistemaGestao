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
   - Armazenar o token em localStorage usando a chave `siscop_token` (definida em LOCAL_STORAGE_TOKEN_KEY)
   - Armazenar o objeto de usuário em localStorage usando a chave `siscop_user`

3. **Principais Endpoints da API**
   - `VITE_NEXT_PUBLIC_API_AUTH_URL`: Autenticação (login)
   - `VITE_NEXT_PUBLIC_API_ME_URL`: Dados do usuário logado
   - `VITE_NEXT_PUBLIC_API_CLIENTES_URL`: Lista de clientes (requer parâmetro `codcoor` em minúsculo do usuário logado)
   - `VITE_NEXT_PUBLIC_API_UNIDADES_URL`: Unidades por cliente e UF
   - `VITE_NEXT_PUBLIC_API_SERVICOS_URL`: Serviços
   - `VITE_NEXT_PUBLIC_API_CONFORMIDADE_URL`: Documentos de conformidade

4. **Otimizações**
   - Implementar cache no localStorage para requisições frequentes
   - Sistema de retry e timeout para chamadas à API para maior robustez
   - Evitar usar a opção `credentials: 'include'` em requisições fetch para prevenir erros de CORS

5. **UI/UX**
   - Tema escuro em toda a aplicação, inclusive formulários
   - Design responsivo para monitores 1920x1080, tablets e telas menores
   - Upload de documentos com drag-and-drop
   - Validação de arquivos (PDF, JPEG, PNG)
   - Limite de 10MB por arquivo e máximo de 5 arquivos

## Especificações de Layout

1. **Dimensões Gerais**
   - Largura total do projeto: 1920px (monitores de alta resolução)
   - Para resoluções menores que 1920px, usar responsividade que alinhe os paineis verticalmente e centralizados
   - Usar scroll vertical para conteúdo que ultrapasse a altura da tela

2. **Blocos e Dimensões**
   - Blocos de topo e faixa do meio: largura de 940px
   - Altura dos blocos superiores: 150px
   - Altura da parte central: 460px
   - Bloco inferior: largura total (1920px), altura de 460px

3. **Espaçamentos**
   - Espaçamento entre blocos: 2px

4. **Componentes Específicos**
   - Largura do dropdown de Clientes: 380px
   - Todos os dropdowns devem incluir funcionalidade de busca por conteúdo com as seguintes características:
     - Campo de busca no topo do dropdown
     - Filtragem em tempo real à medida que o usuário digita
     - Mensagens de feedback quando nenhum item corresponder à busca
     - Suporte à busca case-insensitive (ignorando maiúsculas/minúsculas)
     - Dropdown de UF com largura de 100px
     - Dropdown de Unidades com largura de 380px
   
5. **Organização do Primeiro Bloco (Painel Superior)**
   - **Primeira linha**:
     - Dropdown Clientes
     - Dropdown UFs
     - Checkbox "Todas UFs"
     - Botão "Planilhas" com ícone à esquerda
     - Botão "Contrato" sem ícone
   - **Segunda linha**:
     - Dropdown Unidades (sem label)
     - Régua para paginação de unidades
   - **Terceira linha**:
     - 7 botões com seus respectivos ícones e labels:
       - Editar
       - Ocorrências
       - Custos
       - Ord.Compra
       - Edit.Tarefas
       - Rescisão
       - Pendenciar

## Fluxo de Autenticação e Acesso

1. Usuário faz login com email e senha
2. API retorna `access_token` que é armazenado no localStorage
3. Requisições subsequentes usam este token no cabeçalho Authorization
4. Dados do usuário são obtidos da API após login e armazenados no localStorage
5. Para consultar clientes, sempre usar o parâmetro `codcoor` (em minúsculo) que é o `cod` do usuário logado
6. Permissões e acesso são controlados pelo backend, frontend apenas exibe ou oculta elementos
7. Em caso de erro na API ou token expirado, redirecionar para login
8. Implementar redirecionamento da rota raiz ("/") para a página de login

## Stack Técnico

- React com Vite como framework principal
- TailwindCSS para estilização
- ShadCN UI para componentes
- TanStack Query (React Query) para gerenciamento de chamadas à API
- localStorage para cache e armazenamento de tokens e dados
- ApiService para centralizar chamadas à API com tratamento de erros e cache

## Endpoints Específicos

### Endpoint de Clientes
- URL: `https://amenirealestate.com.br:5601/ger-clientes/clientes`
- Método: GET
- Parâmetro obrigatório: `codcoor` (em minúsculo, deve ser o código do usuário logado)
- Exemplo: `https://amenirealestate.com.br:5601/ger-clientes/clientes?codcoor=110`

### Endpoint de Unidades
- URL: `https://amenirealestate.com.br:5601/ger-clientes/unidades`
- Método: GET
- Parâmetros: `codcli` (código do cliente), `uf` (estado)
- Paginação: `pagina` e `quantidade`
- Exemplo: `https://amenirealestate.com.br:5601/ger-clientes/unidades?codcli=123&uf=SP&pagina=1&quantidade=100`

## Implementação Específica de Clientes
- O dropdown de clientes deve ser populado com dados da API via endpoint `VITE_NEXT_PUBLIC_API_CLIENTES_URL`
- Utilizar o `codcoor` (código do coordenador, em minúsculo) do usuário logado como parâmetro para esta requisição
- Implementar cache para reduzir o número de requisições frequentes
- Implementar fallback para usar dados em cache caso a API falhe temporariamente
- O dropdown de clientes deve ter largura fixa de 380px e incluir funcionalidade de busca

## Padrões de Tratamento de Erros
- Implementar timeout para requisições para evitar esperas infinitas (máximo 15 segundos)
- Implementar sistema de retry para repetir requisições que falham (máximo 1 retry com delay)
- Sempre mostrar mensagens de erro ao usuário usando toast ou notificações
- Capturar e logar detalhes de erros para debug
- Em caso de falha na API, tentar usar dados em cache mesmo que expirados como fallback

## Regras de Uso de Dados
- NUNCA usar dados fictícios, simulados ou "mock data" para popular componentes ou interfaces
- Sempre usar dados autênticos vindos das APIs oficiais
- Não criar ou simular respostas de API inexistentes
- Não implementar funcionalidades que dependam de dados fictícios
- Em casos excepcionais onde dados para desenvolvimento ou testes são necessários, isto deve ser explicitamente solicitado e aprovado