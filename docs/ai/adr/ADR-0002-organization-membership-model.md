# ADR-0002 - Modelo de Usuarios por Organizacao

- Data: 2026-05-05
- Status: PENDENTE

## Contexto

A estrutura de usuarios por organizacao ainda nao esta completamente fechada.
O sistema precisa suportar multi-tenant e papeis por organizacao.

## Decisao

Evoluir para modelo:

1. UserAccount como identidade global.
2. OrganizationMembership como vinculo de papel por organizacao.

## Consequencias

- Afeta schema Prisma e migracoes.
- Afeta fluxo de login e selecao de contexto de organizacao.
- Afeta gestao de convites e administracao de usuarios.

## Alternativas consideradas

1. User vinculado diretamente a uma unica organizacao.
2. Duplicar usuarios por organizacao.

## Acao necessaria

1. Definir papeis finais por organizacao.
2. Definir regras de convite e onboarding.
3. Planejar migracao de dados sem downtime.
