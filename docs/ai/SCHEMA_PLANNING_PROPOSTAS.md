# Planejamento de Schema - Propostas e Tenant

## Objetivo

Consolidar o desenho de dados para suportar:

1. Multi-tenant por organizacao (PF ou PJ com mesmo fluxo).
2. Modulo de propostas aderente a planilha B2026XXX-00.
3. Calculo sob demanda para resumo e impostos.
4. Placeholder de anexos no layout com metadado em banco.

## Decisoes fechadas

1. Email unico global para login.
2. Criacao de conta cria organizacao e usuario inicial automaticamente.
3. PF e PJ usam mesmo fluxo de projeto/proposta.
4. Codigo de projeto/proposta unico por tenant para todo o historico.
5. Calculo de resumo sob demanda (sem snapshot obrigatorio nesta fase).

## Fase 1 - Identidade e tenant

### Entidades

1. Organization
2. UserAccount
3. OrganizationMembership
4. Invitation
5. Subscription

### Regras e constraints

1. UserAccount.email com unique global.
2. OrganizationMembership com unique composto (organizationId, userAccountId).
3. Todas as entidades de negocio com organizationId.
4. Indices por organizationId nas tabelas de leitura frequente.
5. Fluxo transacional de onboarding:
   - cria Organization
   - cria UserAccount inicial
   - cria OrganizationMembership inicial com role OWNER/ADMIN

### Observacao de migracao

Schema atual ainda usa Company e User diretamente. A migracao recomendada e:

1. Introduzir Organization, UserAccount e OrganizationMembership.
2. Migrar Company -> Organization.
3. Migrar User -> UserAccount + Membership.
4. Manter compatibilidade temporaria por camada de servico.

## Fase 2 - Modulo de Propostas (planilha)

### Entidades de cabecalho (aba ORCAMENTO)

1. Proposal
   - organizationId
   - proposalCode (unique no tenant)
   - projectCode (separado quando aplicavel)
   - customerName
   - serviceDescription
   - internalResponsible
   - workType
   - billingType (SERVICOS, PRODUTOS, INDUSTRIALIZACAO)
   - requestDate, completionDate, sentDate, decisionDate
   - status (EM_ELABORACAO, ENVIADA, APROVADA, REPROVADA)
   - rejectionReason
2. ProposalContact
   - proposalId
   - name, email, phone
   - position (1..3)

### Entidades de secoes de custo (input)

1. ProposalModItem (mao de obra direta)
2. ProposalMoiItem (mao de obra indireta)
3. ProposalMaterialItem
4. ProposalEquipmentItem
5. ProposalThirdPartyItem
6. ProposalConsumableItem
7. ProposalExpenseItem

Regra: todas com organizationId, proposalId, itemOrder, custo unitario e subtotal.

### Entidades de configuracao de custo

1. SalaryBaseTable
2. SalaryBaseRole
3. TaxProfile
4. SimplesNacionalRate

### Entidades de calculo e saida

1. ProposalCalculationInput
   - bdiPercent
   - assistancePercent
   - commissionPercent
   - profitPercent
   - safetyFactor
   - taxProfileId
2. ProposalCalculationResult (opcional como cache)
   - totals por secao
   - totalCost
   - saleValueBeforeTaxes
   - taxesValue
   - finalValue

Regra: mesmo com cache, resultado oficial e recalculavel sob demanda.

### Entidades para documentos

1. ProposalDocument
   - proposalId
   - language (PT, ES)
   - format (HTML, PDF, XLSX)
   - generationStatus
   - generatedAt

## Anexos

### Estado atual

1. Ja existe ProjectAttachment com metadado e status de upload.
2. Tela de projeto ja possui placeholder visual de arquivo.

### Complemento recomendado

1. Incluir ProposalAttachment para anexos no contexto da proposta.
2. Reaproveitar mesmos campos de metadado:
   - displayName, storageKey, mimeType, byteSize, status.

## Cobertura da planilha (check)

1. ORCAMENTO: coberto por Proposal + ProposalContact.
2. MOD/MOI: coberto por ProposalModItem e ProposalMoiItem.
3. Materiais: coberto por ProposalMaterialItem.
4. Equipamentos: coberto por ProposalEquipmentItem.
5. Terceiros: coberto por ProposalThirdPartyItem.
6. Consumiveis/EPIs: coberto por ProposalConsumableItem.
7. Despesas: coberto por ProposalExpenseItem.
8. Salarios base: coberto por SalaryBaseTable/Role.
9. Resumo: coberto por ProposalCalculationInput/Result (sob demanda).
10. Proposta PT/ES: coberto por ProposalDocument.
11. Simples Nacional: coberto por SimplesNacionalRate.

## Lacunas restantes (fora do schema)

1. Tela dedicada de Proposta (hoje existe tela de Projeto).
2. Servico de calculo consolidado por secoes + impostos.
3. Renderizacao de documento PT/ES.
4. Exportacao XLSX com estrutura equivalente da planilha.

## Ajustes guiados pelas telas existentes

A modelagem foi expandida considerando telas ja prontas em features:

1. `features/projects/ProjectsScreen.tsx`
   - Projeto exige status, contratante, responsavel, custo previsto e datas.
2. `features/projects/NewProjectScreen.tsx`
   - Projeto exige cabecalho completo e placeholder de anexos.
3. `features/employees/EmployeesScreen.tsx`
   - Necessario `Employee` com custos, regime, horas/dia, encargos e beneficios.
4. `features/time-sheet/TimeSheetScreen.tsx`
   - Necessario vinculo funcionario-projeto, politica de hora extra por organizacao,
     override por funcionario, feriados e snapshot de custo no lancamento.

Entidades adicionadas para cobrir essas telas:

1. Employee
2. EmployeeProjectAssignment
3. OrganizationLaborPolicy
4. EmployeeLaborPolicyOverride
5. OrganizationHoliday
6. TimeSheet
7. TimeSheetEntry

## Ordem de implementacao sugerida

1. Criar models de Fase 1 e migracao inicial.
2. Criar Proposal + secoes de custo (Fase 2).
3. Implementar APIs CRUD com filtro obrigatorio por organizationId.
4. Implementar motor de calculo sob demanda.
5. Implementar documentos e exportacao.
