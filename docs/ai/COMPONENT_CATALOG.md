# Component Catalog

## Objetivo

Catalogar componentes reutilizaveis para evitar duplicacao e orientar IA/humanos antes de criar novos componentes.

## UI Base (Global)

- `components/ui/field-primitives.tsx`: `Input`, `Select`, `Textarea`
- `components/ui/form-field.tsx`: wrappers com label/erro/helper
- `components/ui/button.tsx`: `AppButton` com variantes e tamanhos
- `components/ui/page-shell.tsx`: composicao de layout (`PageShell`, `PageMain`, `PageSection`)

## Providers

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

## Politica de Reuso

1. Antes de criar componente novo, buscar no catalogo e no codigo por equivalente.
2. Se o componente puder ser generico, criar em `components/ui`.
3. Se o componente for de dominio/tela especifica, criar em `features/<feature>/...`.
4. Se um componente de feature comecar a ser usado por outra feature, promover para `components/ui`.
