# Regras de Engenharia

## Banco e Prisma

1. Usar Prisma como camada de acesso principal.
2. Nao introduzir SQL sem necessidade clara.
3. Toda mudanca de modelo deve ter migration ou justificativa documentada.

## Multi-tenant

1. Garantir organizationId em entidades de negocio.
2. Garantir filtro por tenant em repositorios/queries.
3. Testar cenarios de isolamento de dados.
4. Endpoints protegidos devem validar sessao + membership ativa via guard server-side reutilizavel.

## Seguranca

1. Nao commitar segredos, tokens, PAT ou senhas.
2. Usar variaveis de ambiente e provedores seguros.
3. Registrar riscos e decisoes em docs/ai/adr.
4. Sessao web deve usar cookies HTTP-only para access/refresh token.
5. Refresh token deve ser persistido por hash e rotacionado a cada renovacao de sessao.
6. Logout deve revogar sessao persistida no servidor.

## Qualidade

1. Preferir tipagem explicita em entradas de dominio.
2. Evitar regras de negocio em componentes de UI.
3. Centralizar regras em camada de servico/dominio.
4. Incluir validacoes de entrada no backend.
5. Evitar duplicacao de componentes; verificar catalogo antes de criar novo.
6. Rotas em app devem ser wrappers minimos; logica e UI em features.
7. Cores semanticas devem usar design tokens (globals.css) e nao hex repetido.
8. Texto novo de UI deve priorizar chave de traducao (i18n).
9. NUNCA criar lógicas, callbacks ou variáveis com tipagem implícita (ex: `any` implícito) que possam quebrar a compilação no modo estrito. A I.A. deve assegurar que o código gerado compile com sucesso no Vercel (`next build` e `tsc --noEmit`).

## Documentacao viva

1. Mudou regra de negocio: atualizar BUSINESS_RULES.md.
2. Mudou entidade ou relacao: atualizar DOMAIN_MODEL.md.
3. Mudou fluxo funcional: atualizar WORKFLOWS.md.
4. Mudou diretriz tecnica: atualizar ENGINEERING_RULES.md.
