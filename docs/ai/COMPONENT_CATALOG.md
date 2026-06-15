# Component Catalog

## Objetivo

Catalogar componentes reutilizaveis para evitar duplicacao e orientar IA/humanos antes de criar novos componentes.

## UI Base (Global)

- `components/ui/field-primitives.tsx`: `Input`, `Select`, `Textarea` (com estilos built-in)
- `components/ui/form-field.tsx`: `TextField`, `SelectField`, `TextareaField` (wrappers padronizados com icon e label)
- `components/ui/button.tsx`: `AppButton` com variantes (primary, secondary, danger, outline), tamanhos, `icon` e `loading`
- `components/ui/card.tsx`: `Card`, `CardHeader`, `CardContent`, `CardFooter` (com variantes default, elevated, gradient)
- `components/ui/page-header.tsx`: `PageHeader` (wrapper padronizado para título de página e botões de ação)
- `components/ui/badge.tsx`: `Badge` (pill de status com cores semânticas success, danger, warning, etc)
- `components/ui/empty-state.tsx`: `EmptyState` (ilustração, título e botão para listas vazias)
- `components/ui/page-shell.tsx`: composição de layout padronizado (`PageShell`, `PageMain`, `PageSection`)
- `components/ui/skeleton.tsx`: `Skeleton` (placeholder de carregamento/ofuscamento com efeito pulse para UI/UX de alta qualidade)
- `components/ui/dialog.tsx`: `Dialog` (modal/overlay genérico e responsivo com controle de foco e scroll, título e botão de fechar)
- `components/ui/tooltip.tsx`: `InfoTooltip` (balão de ajuda flutuante para explicar campos e regras ao passar o mouse ou focar)

## Design Tokens

- Todos os design tokens estão definidos no Tailwind v4 `theme` inline no arquivo `app/globals.css`.
- Variáveis semânticas: `primary`, `secondary`, `success`, `danger`, `warning`, `info`, `surface`, `border`.

- `components/providers/AppI18nProvider.tsx`: provider i18n global

## Utils Compartilhadas

- `lib/cn.ts`: merge de classes (`clsx` + `tailwind-merge`)

## Features

### Auth

- `features/auth/LoginScreen.tsx`
- `features/auth/RegisterScreen.tsx`
- `features/auth/register/components/RegisterHero.tsx`
- `features/auth/register/components/RegisterPlansGrid.tsx`
- `features/auth/register/components/RegisterBenefits.tsx`
- `features/auth/register/components/RegisterFormCard.tsx`
- `features/auth/register/useRegisterForm.ts`
- `features/auth/register/register.constants.ts`
- `features/auth/register/register.schemas.ts`
- `features/auth/register/register.formatters.ts`
- `features/auth/register/register.types.ts`

### Holidays

- `features/holidays/HolidaysScreen.tsx`

## Politica de Reuso

1. Antes de criar componente novo, buscar no catalogo e no codigo por equivalente.
2. Se o componente puder ser generico, criar em `components/ui`.
3. Se o componente for de dominio/tela especifica, criar em `features/<feature>/...`.
4. Se um componente de feature comecar a ser usado por outra feature, promover para `components/ui`.

## Padrao de registro obrigatorio

Sempre que criar ou mover componente, registrar no catalogo com:

1. Caminho do arquivo.
2. Responsabilidade do componente.
3. Props principais e contrato de uso.
4. Estados suportados (loading, vazio, erro, disabled, etc.).
5. Dependencias de tema/i18n.
6. Onde ja esta sendo reutilizado.
