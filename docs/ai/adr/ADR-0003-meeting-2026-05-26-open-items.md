# ADR-0003 - Pendencias da ata 2026-05-26

- Status: PENDENTE
- Data: 2026-06-15
- Origem: Ata de reuniao 2026-05-26

## Contexto

A ata de 2026-05-26 trouxe direcionamentos para evolucao das telas de projeto, funcionarios, ficha de tempo e configuracoes. Dois pontos vieram com ambiguidade e exigem decisao formal antes de implementacao.

## Pendencias

1. Campo "Vale transporte" em funcionarios.
   - A ata menciona inclusao e remocao no mesmo conjunto de apontamentos.
   - Necessario decidir se o campo permanece no dominio.

2. Limite de anexos para plano pago.
   - A ata indica 50MB para plano gratuito e sem limite para plano pago.
   - "Sem limite" precisa de definicao tecnica e financeira para evitar abuso/custos imprevisiveis.

## Decisao proposta (a validar)

1. Vale transporte: manter como opcional no cadastro de funcionarios, condicionado a necessidade fiscal/operacional do cliente.
2. Plano pago: substituir "sem limite" por limite tecnico configuravel por plano, com valor inicial a definir.

## Impacto

1. Regras de negocio em `BUSINESS_RULES.md`.
2. Fluxo de cadastro de funcionarios e projetos/anexos em `WORKFLOWS.md`.
3. Validacoes backend e limites em upload/storage.

## Proximos passos

1. Validar decisao com produto.
2. Atualizar `BUSINESS_RULES.md` com regra final.
3. Atualizar `NEXT_STEPS.md` trocando status de pendencia para decidido.
