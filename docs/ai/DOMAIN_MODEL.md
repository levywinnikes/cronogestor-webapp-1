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
11. Proposal: cabecalho da proposta comercial.
12. ProposalContact: contatos do cliente por proposta (ate 3).
13. Proposal*Item: secoes de custo (MOD, MOI, Materiais, Equipamentos, Terceiros, Consumiveis, Despesas).
14. SalaryBaseTable e SalaryBaseRole: tabela de salarios base editavel.
15. TaxProfile e SimplesNacionalRate: configuracao tributaria por organizacao.
16. ProposalCalculationInput/Result: entrada e saida de consolidacao financeira.
17. ProposalDocument e ProposalAttachment: saidas geradas e anexos da proposta.
18. AuthSession: sessao autenticada com refresh token rotativo por usuario e organizacao.

## Regras de cardinalidade

1. Uma Organization tem muitos Memberships.
2. Um UserAccount pode ter muitos Memberships.
3. Uma Organization tem muitos Employees.
4. Uma Organization tem muitos Projects.
5. Um Employee pode ter muitos TimeEntries.
6. Um Project pode ter muitos TimeEntries.

## Regras de identidade

1. UserAccount deve ter email unico global.
2. Criacao de Organization deve provisionar UserAccount inicial e Membership inicial no mesmo fluxo transacional.

## Regras de projeto/proposta

1. Codigo de projeto/proposta deve ser unico por organizacao para todo o historico.
2. PF e PJ compartilham o mesmo modelo de projeto/proposta.
3. Consolidados financeiros podem ser derivados por calculo sob demanda.

## Regras de isolamento

1. Tabelas de negocio devem carregar organizationId.
2. Consultas devem filtrar organizationId por padrao.
3. Acesso cross-tenant permitido apenas para papel global de plataforma.

## Observacoes para migracao

1. Company atual tende a evoluir para Organization.
2. User atual tende a separar em UserAccount + Membership.
3. TimeEntry deve migrar para armazenar tempos de forma robusta (timestamp/minutos) quando possivel.
