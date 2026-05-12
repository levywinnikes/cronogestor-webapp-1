# Base de Conhecimento para IA

## Objetivo

Centralizar contexto de negocio, dominio e engenharia para que qualquer IA trabalhe com consistencia neste projeto.

## Como usar

1. Ler AGENTS.md.
2. Ler os documentos desta pasta na ordem abaixo.
3. Validar se a mudanca proposta respeita as regras.
4. Atualizar esta base no mesmo ciclo de mudanca.

## Ordem de leitura

1. BUSINESS_RULES.md
2. DOMAIN_MODEL.md
3. WORKFLOWS.md
4. ENGINEERING_RULES.md
5. adr/README.md
6. UPDATE_CHECKLIST.md
7. COMPONENT_WORKFLOW.md
8. COMPONENT_CATALOG.md
9. I18N_AND_THEME.md
10. SCHEMA_PLANNING_PROPOSTAS.md

## Fonte de verdade

- Regras de negocio: BUSINESS_RULES.md
- Estrutura de dados: DOMAIN_MODEL.md
- Fluxos da aplicacao: WORKFLOWS.md
- Regras de implementacao: ENGINEERING_RULES.md
- Duvidas e decisoes: adr/README.md

## Estado atual

Sistema em evolucao com base em telas existentes:

- registro
- login
- dashboard de projetos
- cadastro de funcionarios
- ficha tempo

Varios modulos ainda operam com dados mock e devem migrar para Prisma gradualmente.
