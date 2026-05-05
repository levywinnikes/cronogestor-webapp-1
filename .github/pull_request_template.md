# Pull Request

## Resumo

Descreva objetivamente o que mudou e por que essa alteracao foi necessaria.

## Tipo de mudanca

- [ ] feat
- [ ] fix
- [ ] refactor
- [ ] docs
- [ ] chore
- [ ] perf
- [ ] test

## Evidencias de validacao

- [ ] Testes locais executados
- [ ] Validacao manual executada
- [ ] Sem regressao funcional conhecida

Descreva os testes/validacoes realizados:

## Checklist obrigatorio de governanca (docs/ai)

Base: docs/ai/UPDATE_CHECKLIST.md

- [ ] Releitura de docs/ai/README.md
- [ ] Verificado se regra de negocio mudou (docs/ai/BUSINESS_RULES.md)
- [ ] Verificado se modelo de dominio mudou (docs/ai/DOMAIN_MODEL.md)
- [ ] Verificado se fluxos mudaram (docs/ai/WORKFLOWS.md)
- [ ] Verificado se diretriz tecnica mudou (docs/ai/ENGINEERING_RULES.md)
- [ ] ADR index atualizado (docs/ai/adr/README.md)
- [ ] ADR criado/atualizado para mudancas arquiteturais relevantes
- [ ] Codigo e documentacao estao alinhados
- [ ] Mudancas de seguranca/acesso documentadas

## Impacto de banco/dados

- [ ] Sem impacto de schema
- [ ] Com impacto de schema (migracao incluida)
- [ ] Com impacto de dados (backfill/ajuste necessario)

Se houver impacto, detalhe plano de rollout/rollback:

## Multi-tenant e seguranca

- [ ] Escopo por organizacao preservado
- [ ] Sem vazamento cross-tenant
- [ ] Sem segredos em codigo/versionamento

## Pendencias

Liste itens que ficaram para um proximo PR.
