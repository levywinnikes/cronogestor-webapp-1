# AGENTS

## Objetivo

Este arquivo define as regras de trabalho para qualquer IA atuando neste repositorio.
A IA deve consultar estes documentos antes de propor mudancas ou editar codigo.

## Ordem de leitura obrigatoria

1. docs/ai/README.md
2. docs/ai/BUSINESS_RULES.md
3. docs/ai/DOMAIN_MODEL.md
4. docs/ai/WORKFLOWS.md
5. docs/ai/ENGINEERING_RULES.md
6. docs/ai/adr/README.md
7. docs/ai/COMPONENT_WORKFLOW.md
8. docs/ai/COMPONENT_CATALOG.md
9. docs/ai/I18N_AND_THEME.md

## Regras operacionais

1. Nenhuma implementacao deve contradizer regras do negocio documentadas.
2. Em caso de conflito entre codigo e documento, a IA deve:
   reportar o conflito, sugerir caminho e atualizar documentacao junto da mudanca aprovada.
3. Toda mudanca relevante em dominio, fluxo ou seguranca deve atualizar docs/ai.
4. Se algo estiver indefinido, registrar novo ADR em docs/ai/adr com status "PENDENTE".
5. Aplicar o checklist de governanca definido em .github/pull_request_template.md.
6. Antes de criar novo componente, verificar reuso em docs/ai/COMPONENT_CATALOG.md.

## Definicao de pronto para mudancas

1. Regras de negocio verificadas.
2. Impacto no dominio e multi-tenant verificado.
3. Documentacao atualizada no mesmo PR/commit.
