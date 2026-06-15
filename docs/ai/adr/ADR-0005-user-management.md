# ADR-0005 - Cadastro e Gestão de Usuários do Tenant (Configurações)

- Status: PROPOSTO
- Data: 2026-06-15
- Origem: Solicitação do usuário na área de Configurações

## Contexto

A plataforma necessita de uma interface administrativa para que gestores de uma instituição (tenant) possam convidar novos membros, definir seus níveis de permissão e desativar contas, garantindo o isolamento multi-tenant de dados.

## Decisão Proposta

1. **Localização na UI**:
   - Adicionar uma nova aba lateral na área de Configurações denominada **"Usuários"** (logo abaixo de "Feriados" na tela de Configurações).

2. **Fluxo de Dados e Permissões**:
   - O painel listará todos os registros da tabela `OrganizationMembership` vinculados à `Organization` ativa do tenant.
   - Serão exibidos: Nome do Usuário, E-mail, Papel (`MembershipRole`: `OWNER`, `ADMIN`, `EDITOR`, `VIEWER`) e Status (`MembershipStatus`: `ACTIVE`, `INVITED`, `DISABLED`).
   - Apenas usuários com papel `OWNER` ou `ADMIN` no tenant ativo poderão convidar ou editar papéis de outros membros.

3. **Ações Disponíveis**:
   - **Convidar Usuário (Invite)**:
     - Abertura de modal solicitando E-mail e seleção do Papel.
     - Criação de um registro na tabela `Invitation` com link de aceite, ou criação direta da membership em estado `INVITED` caso o e-mail já possua uma conta global.
   - **Alterar Permissão (Editar Papel)**:
     - Permitir a promoção/demissão de papéis (ex: de `VIEWER` para `EDITOR`).
     - Donos (`OWNER`) não podem ser rebaixados por terceiros.
   - **Habilitar/Desabilitar**:
     - Botão para alternar o status do membro entre `ACTIVE` e `DISABLED` (bloqueando acesso ao tenant imediatamente sem deletar o histórico de lançamentos do usuário).

## Consequências e Impacto

- **Segurança**: Todos os endpoints de API de usuários e convites devem implementar o guard de tenant (`requireTenantContext`) validando se o executor possui papel administrativo (`OWNER`/`ADMIN`).
- **Navegação**: O layout da página de configurações será modificado para renderizar o link de Usuários no menu lateral.
