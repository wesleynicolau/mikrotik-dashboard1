# MikroTik Dashboard - TODO

## Banco de Dados & Schema
- [x] Criar tabela de configurações MikroTik (IP, porta, usuário, senha)
- [x] Criar tabela de histórico de métricas (para gráficos)
- [x] Executar migrations do banco de dados

## Backend (Node.js / tRPC)
- [x] Implementar cliente RouterOS (conexão API)
- [x] Criar procedimento para salvar/atualizar configurações MikroTik
- [x] Criar procedimento para buscar dados do sistema (CPU, memória, disco)
- [x] Criar procedimento para buscar informações gerais (modelo, versão, uptime)
- [x] Criar procedimento para buscar dados de interfaces (tráfego)
- [x] Implementar tratamento de erros de conexão
- [x] Adicionar testes unitários (vitest)

## Frontend (React / Tailwind)
- [x] Configurar tema visual (cores, tipografia)
- [x] Criar layout do dashboard com DashboardLayout
- [x] Criar página de configuração (formulário de credenciais)
- [x] Criar cards de métricas (CPU, memória, disco)
- [x] Criar componente de indicador visual (progress bar/gauge)
- [x] Criar gráficos de tráfego de interfaces (recharts)
- [x] Criar card de informações gerais (modelo, versão, uptime)
- [x] Implementar polling automático de dados
- [x] Implementar feedback visual de status de conexão
- [x] Implementar tratamento de erros na UI

## Integração & Validação
- [x] Testar conexão com RouterOS real
- [x] Validar atualização em tempo real dos dados
- [x] Testar responsividade em dispositivos móveis
- [x] Criar checkpoint final
