# Copilot Instructions

## Sempre consultar antes de editar

Leia obrigatoriamente, nesta ordem:

1. AGENTS.md
2. docs/ai/README.md
3. docs/ai/BUSINESS_RULES.md
4. docs/ai/DOMAIN_MODEL.md
5. docs/ai/WORKFLOWS.md
6. docs/ai/ENGINEERING_RULES.md
7. docs/ai/adr/README.md
8. docs/ai/UPDATE_CHECKLIST.md

## Regras de implementacao

1. Preservar isolamento por organizacao (multi-tenant).
2. Nao introduzir credenciais, tokens ou segredos em codigo versionado.
3. Atualizar docs/ai quando regra de negocio, fluxo ou modelo de dados mudar.
4. Se houver ambiguidade, registrar ADR em docs/ai/adr e marcar como PENDENTE.
5. Toda mudanca deve considerar o checklist de governanca usado no PR template.

## Escopo atual do sistema

- Cadastro de conta/organizacao.
- Login.
- Projetos.
- Funcionarios.
- Ficha de tempo.
- Planejamento de papel global de administracao da plataforma.
