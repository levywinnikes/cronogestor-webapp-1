# Modelo de Dominio (Plano)

## Objetivo

Definir a estrutura de dados alvo para suportar o sistema com multi-tenant por organizacao.

## Entidades principais

1. Organization: tenant raiz com dados cadastrais da conta.
2. UserAccount: identidade global (email, senha, estado).
3. OrganizationMembership: vinculo UserAccount x Organization com papel dentro da organizacao.
4. Employee: colaborador operacional da organizacao.
5. Project: projeto da organizacao.
6. ProjectMember: vinculo de pessoas em projetos.
7. TimeEntry: lancamentos de horas.
8. Subscription: plano e estado de assinatura da organizacao.
9. Invitation: convite para entrada de usuario na organizacao.
10. AuditLog: trilha de seguranca e administracao.

## Regras de cardinalidade

1. Uma Organization tem muitos Memberships.
2. Um UserAccount pode ter muitos Memberships.
3. Uma Organization tem muitos Employees.
4. Uma Organization tem muitos Projects.
5. Um Employee pode ter muitos TimeEntries.
6. Um Project pode ter muitos TimeEntries.

## Regras de isolamento

1. Tabelas de negocio devem carregar organizationId.
2. Consultas devem filtrar organizationId por padrao.
3. Acesso cross-tenant permitido apenas para papel global de plataforma.

## Observacoes para migracao

1. Company atual tende a evoluir para Organization.
2. User atual tende a separar em UserAccount + Membership.
3. TimeEntry deve migrar para armazenar tempos de forma robusta (timestamp/minutos) quando possivel.
