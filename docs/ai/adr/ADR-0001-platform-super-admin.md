# ADR-0001 - Papel Global de Administracao da Plataforma

- Data: 2026-05-05
- Status: PENDENTE

## Contexto

Existe necessidade de um usuario administrativo da Cronogestor com visao global do sistema.
Ainda nao ha definicao final de escopo, permissoes e trilha de auditoria.

## Decisao

Definir modelo final entre:

1. Role global em UserAccount.
2. Estrutura dedicada de permissoes globais da plataforma.

## Consequencias

- Afeta autenticacao e autorizacao.
- Afeta filtros multi-tenant e politicas de isolamento.
- Exige trilha de auditoria obrigatoria para acoes globais.

## Alternativas consideradas

1. Nao ter papel global.
2. Papel global sem auditoria.

## Acao necessaria

1. Definir escopo funcional minimo do papel global.
2. Definir eventos auditaveis obrigatorios.
3. Aprovar modelo de dados e seguranca.
