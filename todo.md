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
- [x] Corrigir roteamento para /dashboard e /settings

## Integração & Validação
- [x] Testar conexão com RouterOS real
- [x] Validar atualização em tempo real dos dados
- [x] Testar responsividade em dispositivos móveis
- [x] Criar checkpoint final

## Correções e Melhorias
- [x] Corrigir roteamento 404 em /dashboard (problema com nested routes)
- [x] Validar testes após correção
- [x] Corrigir erro de query de métricas quando credenciais não estão configuradas
- [x] Adicionar tela de configuração inicial com validação de credenciais
- [x] Melhorar tratamento de erros com feedback visual ao usuário
- [x] Corrigir erro de mutation em Settings (falta de import Zod)
- [x] Adicionar logs de erro para debug
- [x] Corrigir erro de polling em background quando navega para Settings
- [x] Adicionar cleanup de queries quando componente desmonta
- [x] Cancelar polling quando autoRefresh é desativado
- [x] Melhorar mensagens de erro com classificação de tipo de falha
- [x] Adicionar detecção de timeout, autenticação, firewall e outros erros

## Gerenciamento de Conexões (CRÍTICO)
- [x] Implementar reutilização de conexão única (não abrir nova a cada query)
- [x] Adicionar pool de conexões com limite configurável
- [x] Implementar timeout automático para desconectar sessões inativas
- [x] Adicionar método para fechar todas as conexões ao desligar o servidor
- [ ] Testar com limite de sessões do RouterOS
