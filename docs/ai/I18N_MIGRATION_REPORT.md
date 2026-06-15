# Relatório de Migração I18N - Textos Avulsos

**Data**: 11 de maio de 2026  
**Escopo**: Varredura completa de textos hardcoded para migração para sistema de locale  
**Status**: Em Progresso

---

## 1. Resumo Executivo

Foram identificados **8 componentes principais** com textos hardcoded em português/inglês misturados. A migração será estruturada por domínio (auth, navigation, buttons, labels, messages) para evitar conflito de escopos.

**Chaves propostas**:

- `common.nav.*` - navegação e headers
- `common.buttons.*` - botões genéricos
- `common.labels.*` - labels de campos
- `common.messages.*` - mensagens de erro/sucesso
- `login.*` - tela de login
- `timesheet.*` - ficha de tempo
- `projects.*` - projetos
- `employees.*` - funcionários
- `dashboard.*` - dashboard

---

## 2. Arquivos com Textos Hardcoded

### 2.1 Components

#### [components/Header.tsx](components/Header.tsx)

| Texto          | Tipo | EN          | PT-BR          |
| -------------- | ---- | ----------- | -------------- |
| "Projetos"     | link | "Projects"  | "Projetos"     |
| "Funcionários" | link | "Employees" | "Funcionários" |

**Chaves propostas**:

```
common.nav.projects
common.nav.employees
```

---

### 2.2 Features / Auth

#### [features/auth/LoginScreen.tsx](features/auth/LoginScreen.tsx)

| Texto                                          | Tipo        | Status | EN                                               | PT-BR                                          |
| ---------------------------------------------- | ----------- | ------ | ------------------------------------------------ | ---------------------------------------------- |
| "E-mail"                                       | label       | ❌     | "Email"                                          | "E-mail"                                       |
| "seu@email.com"                                | placeholder | ❌     | "you@company.com"                                | "seu@email.com"                                |
| "Senha"                                        | label       | ❌     | "Password"                                       | "Senha"                                        |
| "••••••••"                                     | placeholder | ✓      | (same)                                           | (same)                                         |
| "Entrar"                                       | button      | ❌     | "Sign In"                                        | "Entrar"                                       |
| "Esqueci a senha"                              | link        | ❌     | "Forgot Password"                                | "Esqueci a senha"                              |
| "Criar conta"                                  | link        | ❌     | "Create Account"                                 | "Criar conta"                                  |
| "Endereço de e-mail inválido."                 | error       | ❌     | "Invalid email address."                         | "Endereço de e-mail inválido."                 |
| "A senha deve ter no mínimo 6 caracteres."     | error       | ❌     | "Password must have at least 6 characters."      | "A senha deve ter no mínimo 6 caracteres."     |
| "Credenciais inválidas"                        | error       | ❌     | "Invalid credentials"                            | "Credenciais inválidas"                        |
| "Admin:"                                       | label       | ❌     | (test creds)                                     | "Admin:"                                       |
| "Free:"                                        | label       | ❌     | (test creds)                                     | "Free:"                                        |
| "Inativo:"                                     | label       | ❌     | (test creds)                                     | "Inativo:"                                     |
| "Senha:"                                       | label       | ❌     | (test creds)                                     | "Senha:"                                       |
| "Conheça o Plano Premium!"                     | modal title | ❌     | "Discover the Premium Plan!"                     | "Conheça o Plano Premium!"                     |
| "Cronogestor é um produto do Grupo Cronosfera" | footer      | ❌     | "Cronogestor is a product from Cronosfera Group" | "Cronogestor é um produto do Grupo Cronosfera" |
| "Credenciais de Teste"                         | box title   | ❌     | "Test Credentials"                               | "Credenciais de Teste"                         |

**Chaves propostas**:

```
login.email
login.password
login.submit
login.forgot
login.signup
login.errors.invalidEmail
login.errors.passwordMinLength
login.errors.invalidCredentials
login.testCredentials.title
login.testCredentials.admin
login.testCredentials.free
login.testCredentials.inactive
login.testCredentials.password
login.footer
login.premiumPromo.title
```

---

#### [features/auth/register/components/RegisterFormCard.tsx](features/auth/register/components/RegisterFormCard.tsx)

✓ **Já migrado** para `register.form.*`

---

### 2.3 Features / Dashboard

#### [features/projects/ProjectsScreen.tsx](features/projects/ProjectsScreen.tsx)

| Texto               | Tipo   | EN            | PT-BR               |
| ------------------- | ------ | ------------- | ------------------- |
| "Projetos"          | title  | "Projects"    | "Projetos"          |
| "Adicionar projeto" | button | "Add Project" | "Adicionar projeto" |

**Chaves propostas**:

```
dashboard.title
dashboard.buttons.addProject
```

---

### 2.4 Features / Projects

#### [features/projects/NewProjectScreen.tsx](features/projects/NewProjectScreen.tsx)

| Texto                              | Tipo          | EN                          | PT-BR                              |
| ---------------------------------- | ------------- | --------------------------- | ---------------------------------- |
| "Adicionar Projeto"                | page title    | "Add Project"               | "Adicionar Projeto"                |
| "Salvar Projeto"                   | button        | "Save Project"              | "Salvar Projeto"                   |
| "Informações Básicas"              | section title | "Basic Information"         | "Informações Básicas"              |
| "Cadastro completo"                | radio label   | "Full Registration"         | "Cadastro completo"                |
| "Cadastro simples"                 | radio label   | "Simple Registration"       | "Cadastro simples"                 |
| "Nome do Projeto"                  | label         | "Project Name"              | "Nome do Projeto"                  |
| "Status"                           | label         | "Status"                    | "Status"                           |
| "Novo Projeto"                     | breadcrumb    | "New Project"               | "Novo Projeto"                     |
| "O nome do projeto é obrigatório." | error         | "Project name is required." | "O nome do projeto é obrigatório." |
| "Data de início é obrigatória."    | error         | "Start date is required."   | "Data de início é obrigatória."    |
| "Erro ao salvar o projeto."        | error         | "Error saving project."     | "Erro ao salvar o projeto."        |

**Chaves propostas**:

```
projects.page.title
projects.page.basicInfo
projects.buttons.save
projects.labels.name
projects.labels.status
projects.registration.full
projects.registration.simple
projects.errors.nameRequired
projects.errors.startDateRequired
projects.errors.saveFailed
```

---

### 2.5 Features / Time Sheet

#### [features/time-sheet/TimeSheetScreen.tsx](features/time-sheet/TimeSheetScreen.tsx)

| Texto                                                                   | Tipo          | EN                                | PT-BR                                                                   |
| ----------------------------------------------------------------------- | ------------- | --------------------------------- | ----------------------------------------------------------------------- |
| "Lançamento de Ficha Tempo"                                             | title         | "Time Sheet Entry"                | "Lançamento de Ficha Tempo"                                             |
| "Fechar Ficha"                                                          | button        | "Close Sheet"                     | "Fechar Ficha"                                                          |
| "Adicionar Dia"                                                         | button title  | "Add Day"                         | "Adicionar Dia"                                                         |
| "Excluir"                                                               | button title  | "Delete"                          | "Excluir"                                                               |
| "Projeto"                                                               | label         | "Project"                         | "Projeto"                                                               |
| "Funcionário"                                                           | label         | "Employee"                        | "Funcionário"                                                           |
| "Data"                                                                  | table header  | "Date"                            | "Data"                                                                  |
| "Entrada"                                                               | table header  | "Start Time"                      | "Entrada"                                                               |
| "Saída"                                                                 | table header  | "End Time"                        | "Saída"                                                                 |
| "Intervalo"                                                             | table header  | "Break"                           | "Intervalo"                                                             |
| "Horas Extras"                                                          | badge         | "Overtime"                        | "Horas Extras"                                                          |
| "Nenhuma Entrada"                                                       | empty state   | "No Entries"                      | "Nenhuma Entrada"                                                       |
| "Salvar"                                                                | button        | "Save"                            | "Salvar"                                                                |
| "Total Trabalhado"                                                      | footer label  | "Total Worked"                    | "Total Trabalhado"                                                      |
| "Total Extra"                                                           | footer label  | "Total Overtime"                  | "Total Extra"                                                           |
| "Erro ao carregar contexto da ficha"                                    | console error | "Error loading timesheet context" | "Erro ao carregar contexto da ficha"                                    |
| "Erro ao fechar ficha tempo"                                            | console error | "Error closing timesheet"         | "Erro ao fechar ficha tempo"                                            |
| "Observação: Lançamentos com horas extras serao analisados pelo gestor" | alert         | (similar)                         | "Observação: Lançamentos com horas extras serao analisados pelo gestor" |

**Chaves propostas**:

```
timesheet.page.title
timesheet.buttons.closeSheet
timesheet.buttons.addDay
timesheet.buttons.delete
timesheet.buttons.save
timesheet.labels.project
timesheet.labels.employee
timesheet.table.date
timesheet.table.start
timesheet.table.end
timesheet.table.break
timesheet.table.overtime
timesheet.emptyState
timesheet.footer.totalWorked
timesheet.footer.totalOvertime
timesheet.alert.overtimeNotice
timesheet.errors.loadContextFailed
timesheet.errors.closeSheetFailed
```

---

### 2.6 Features / Employees

#### [features/employees/EmployeesScreen.tsx](features/employees/EmployeesScreen.tsx)

| Texto                         | Tipo          | EN                        | PT-BR                         |
| ----------------------------- | ------------- | ------------------------- | ----------------------------- |
| "Gerenciar Funcionários"      | title         | "Manage Employees"        | "Gerenciar Funcionários"      |
| "Salvar Cadastro"             | button        | "Save"                    | "Salvar Cadastro"             |
| "Novo"                        | button        | "New"                     | "Novo"                        |
| "Deletar"                     | button        | "Delete"                  | "Deletar"                     |
| "Erro ao salvar funcionario"  | console error | "Error saving employee"   | "Erro ao salvar funcionario"  |
| "Erro ao excluir funcionario" | console error | "Error deleting employee" | "Erro ao excluir funcionario" |

**Chaves propostas**:

```
employees.page.title
employees.buttons.save
employees.buttons.new
employees.buttons.delete
employees.errors.saveFailed
employees.errors.deleteFailed
```

---

## 3. Estrutura de Chaves Recomendada

```
common.json
├── nav (navegação)
├── buttons (botões genéricos)
├── labels (labels genéricos)
├── messages (mensagens genéricas)
├── validation (mensagens de validação)
├── footer (rodapé)
└── testCredentials (credenciais de teste)

login.json (ou em common.json)
├── email
├── password
├── submit
├── forgot
├── signup
├── errors
└── testCredentials

timesheet.json (ou em common.json)
├── page
├── buttons
├── labels
├── table
├── footer
├── emptyState
├── alert
└── errors

projects.json (ou em common.json)
├── page
├── buttons
├── labels
├── registration
└── errors

employees.json (ou em common.json)
├── page
├── buttons
└── errors

dashboard.json (ou em common.json)
├── title
└── buttons
```

---

## 4. Prioridade de Migração

1. **Alta** ⚡
   - [x] Register (já concluído)
   - [ ] Login (8 componentes, 13 textos)
   - [ ] Header (2 textos)

2. **Média** ⚠️
   - [ ] TimeSheet (18 textos)
   - [ ] Projects (10 textos)
   - [ ] Employees (6 textos)

3. **Baixa** ℹ️
   - [ ] Dashboard (2 textos)
   - [ ] Console errors (diagnostics only, mas recomendável)

---

## 5. Próximos Passos

- [ ] Adicionar chaves de locale em `pt-BR/common.json`
- [ ] Adicionar chaves de locale em `en/common.json`
- [ ] Migrar componentes em ordem de prioridade
- [ ] Validar lint após cada etapa
- [ ] Testar UI em ambos locales
- [ ] Commit por domínio (login, timesheet, projects, etc.)

---

## 6. Estimativa

- **Tempo estimado**: ~30-40 min (6 componentes × 5-8 min cada)
- **Commits sugeridos**: 5 (register ✓, login, core-features, dashboard, validation)
- **Risco de regressão**: Baixo (alterações isoladas em UI strings)
