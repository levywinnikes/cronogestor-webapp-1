# Regras de Engenharia

## Banco e Prisma

1. Usar Prisma como camada de acesso principal.
2. Nao introduzir SQL sem necessidade clara.
3. Toda mudanca de modelo deve ter migration ou justificativa documentada.

## Multi-tenant

1. Garantir organizationId em entidades de negocio.
2. Garantir filtro por tenant em repositorios/queries.
3. Testar cenarios de isolamento de dados.

## Seguranca

1. Nao commitar segredos, tokens, PAT ou senhas.
2. Usar variaveis de ambiente e provedores seguros.
3. Registrar riscos e decisoes em docs/ai/adr.

## Qualidade

1. Preferir tipagem explicita em entradas de dominio.
2. Evitar regras de negocio em componentes de UI.
3. Centralizar regras em camada de servico/dominio.
4. Incluir validacoes de entrada no backend.

## Documentacao viva

1. Mudou regra de negocio: atualizar BUSINESS_RULES.md.
2. Mudou entidade ou relacao: atualizar DOMAIN_MODEL.md.
3. Mudou fluxo funcional: atualizar WORKFLOWS.md.
4. Mudou diretriz tecnica: atualizar ENGINEERING_RULES.md.
