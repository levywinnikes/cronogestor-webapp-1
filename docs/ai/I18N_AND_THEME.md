# I18n and Theme Guide

## Tema (Design Tokens)

Fonte de verdade: `app/globals.css`

Tokens base atuais:

- `--color-primary`
- `--color-primary-700`
- `--color-secondary`
- `--color-secondary-700`
- `--color-surface`
- `--background`
- `--foreground`

Regra: novas cores semanticas devem virar token antes de uso em componente.

## I18n

Arquivos base:

- `lib/i18n/client.ts`
- `components/providers/AppI18nProvider.tsx`
- `locales/pt-BR/common.json`
- `locales/en/common.json`

Regra: texto novo de UI deve ser adicionado em dicionario com chave semantica.

Exemplo de chave:

- `register.form.title`
- `dashboard.projects.empty`

## Dependencias

- `i18next`
- `react-i18next`
- `i18next-browser-languagedetector`
