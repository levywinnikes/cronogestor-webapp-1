# Fluxos de Negocio

## Registro de nova organizacao

1. Usuario escolhe plano e informa dados de cadastro.
2. Sistema cria Organization.
3. Sistema cria UserAccount inicial.
4. Sistema cria OrganizationMembership com papel OWNER/ADMIN.
5. Sistema registra Subscription inicial.

## Login

1. Usuario autentica com email e senha.
2. Sistema identifica memberships disponiveis.
3. Se houver mais de uma organizacao, usuario escolhe contexto ativo.
4. Sistema cria sessao em AuthSession e emite access token + refresh token em cookies HTTP-only.
5. Sessao passa a operar no tenant selecionado.

## Renovacao de sessao

1. Cliente chama endpoint de refresh antes de expirar autenticacao de curta duracao.
2. Sistema valida refresh token, sessao e tenant associado.
3. Sistema rotaciona refresh token e renova access token.

## Logout

1. Cliente chama endpoint de logout.
2. Sistema revoga sessao persistida e limpa cookies HTTP-only.

## Cadastro de projeto

1. Usuario com permissao cria projeto dentro da organizacao ativa.
2. Projeto inicia com status padrao.
3. Projeto pode habilitar gestao de tarefas.
4. Codigo do projeto deve ser validado como unico no tenant em toda a base historica.
5. Enquanto a migracao Company -> Organization nao terminar, API pode usar bridge temporario por documento da organizacao para localizar dados legados.

## Cadastro de funcionario

1. Usuario com permissao registra colaborador na organizacao ativa.
2. Sistema guarda base de custo e jornada.
3. Colaborador pode ou nao ter conta de login vinculada.
4. Operacoes de listagem/criacao/edicao/exclusao devem passar por endpoint protegido com validacao de sessao e tenant.

## Lancamento de ficha tempo

1. O botão de adicionar ficha tempo fica no cabeçalho (Header) global, permitindo lançar horas de qualquer tela.
2. No lançamento global, o usuário seleciona obrigatoriamente o projeto, o funcionário, a data e os turnos. O sistema mescla com os lançamentos existentes do mês e salva.
3. A tela de Ficha Tempo é utilizada para consultas, filtros e edição/exclusão.
4. O filtro de projeto da Ficha Tempo possui a opção "Todos os Projetos" para permitir visualização consolidada por colaborador.
5. Edições ou exclusões diretas na tela salvam localmente (se filtrado por projeto) ou persistem automaticamente no banco (se no modo consolidado "Todos").
6. Fechamento da ficha (salvamento em lote do mês) deve persistir TimeSheet/TimeSheetEntry via endpoint protegido por tenant, exigindo seleção de um projeto específico.
7. **Conflito entre projetos (ADR-0008):** interseção cross-project divide **apenas o tempo conflitante** em partes iguais (1/N). Save exige modal de confirmação; exclusão de entry conflitante exige modal de impacto nos lançamentos restantes. Lançamentos com hora compartilhada exibem flag na listagem; tooltip no hover lista projetos conflitantes. Jornada usa total físico único do dia. Overlap no **mesmo** projeto continua bloqueado.

## Gestao de feriados

1. Usuario autenticado acessa a tela de feriados no tenant ativo.
2. Sistema lista feriados da organizacao ativa (OrganizationHoliday).
3. Usuario com permissao adiciona feriado com data, nome e tipo.
4. Usuario com permissao exclui feriado da propria organizacao.
5. Todas operacoes devem respeitar isolamento por tenant via guard server-side.

## Calculo de proposta

1. Sistema le itens de entrada por secao (MOD, MOI, Materiais, Equipamentos, Terceiros, Consumiveis, Despesas).
2. Sistema recalcula totais e impostos sob demanda na consulta/acao de calcular.
3. Resultado calculado e retornado para UI sem obrigacao de persistir snapshot neste momento.

## Gestao de proposta

1. Usuario cria proposta com cabecalho ORCAMENTO e contatos (ate 3).
2. Usuario preenche secoes de custo por tipo de item.
3. Sistema aplica configuracoes de salario base e regime tributario.
4. Sistema gera consolidado sob demanda para resumo comercial.
5. Usuario pode gerar documentos PT/ES e anexar arquivos de suporte.

## Administracao global da plataforma

1. Papel global pode visualizar dados de todas organizacoes.
2. Acesso global deve ser restrito, logado e auditavel.
3. Escopo funcional exato permanece PENDENTE.

## Fluxo de desenvolvimento orientado por documentacao

1. Registrar demanda antes de codar em `docs/ai/NEXT_STEPS.md` com origem (ata/issue), escopo e prioridade.
2. Definir criterio de aceite e impacto em multi-tenant, seguranca e i18n.
3. Validar reuso de componentes em `docs/ai/COMPONENT_CATALOG.md` e registrar estrategia de UI.
4. Somente apos documentacao aprovada iniciar implementacao.
5. Ao concluir, atualizar status do item em `NEXT_STEPS.md` e ajustar docs de regra/modelo/fluxo se houve mudanca.
