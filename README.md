# Cronogestor Webapp

Aplicacao Next.js com Prisma ORM para persistencia em PostgreSQL (Neon).

## Requisitos

- Node.js 20+
- Yarn 4+
- Banco PostgreSQL com TLS

## Configuracao de Ambiente

1. Revise os placeholders em `.env`.
2. Defina `DATABASE_URL` com a connection string real do seu banco.
3. Opcional: preencha variaveis de seed (`SEED_ADMIN_*`).

O arquivo `.env.example` serve como modelo seguro para onboarding.

## Comandos de Banco (Prisma)

```bash
yarn prisma:generate     # gera Prisma Client
yarn prisma:migrate      # cria/aplica migration em dev
yarn prisma:deploy       # aplica migrations em producao
yarn db:push             # sincroniza schema sem migration (uso controlado)
yarn db:seed             # executa seed
yarn db:studio           # abre Prisma Studio
```

## Desenvolvimento

```bash
yarn dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## Base de Conhecimento para IA

Antes de qualquer mudanca no projeto, consulte:

1. [AGENTS.md](AGENTS.md)
2. [docs/ai/README.md](docs/ai/README.md)
3. [docs/ai/BUSINESS_RULES.md](docs/ai/BUSINESS_RULES.md)
4. [docs/ai/DOMAIN_MODEL.md](docs/ai/DOMAIN_MODEL.md)
5. [docs/ai/WORKFLOWS.md](docs/ai/WORKFLOWS.md)
6. [docs/ai/ENGINEERING_RULES.md](docs/ai/ENGINEERING_RULES.md)
7. [docs/ai/adr/README.md](docs/ai/adr/README.md)
8. [docs/ai/UPDATE_CHECKLIST.md](docs/ai/UPDATE_CHECKLIST.md)

Objetivo: manter implementacao e regras sempre alinhadas e atualizadas.

## Seguranca

- Nunca versionar segredos em arquivos tracked.
- Nunca salvar PAT em URL de remote Git.
- Rotacione credenciais se houver suspeita de vazamento.
