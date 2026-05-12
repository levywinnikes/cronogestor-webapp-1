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

1. Selecionar projeto e colaborador do mesmo tenant.
2. Lancar datas e jornadas.
3. Calcular custo por regras vigentes.
4. Salvar entradas com rastreabilidade.
5. Fechamento da ficha deve persistir TimeSheet/TimeSheetEntry via endpoint protegido por tenant.

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
