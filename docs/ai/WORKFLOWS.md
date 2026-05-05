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
4. Sessao passa a operar no tenant selecionado.

## Cadastro de projeto

1. Usuario com permissao cria projeto dentro da organizacao ativa.
2. Projeto inicia com status padrao.
3. Projeto pode habilitar gestao de tarefas.

## Cadastro de funcionario

1. Usuario com permissao registra colaborador na organizacao ativa.
2. Sistema guarda base de custo e jornada.
3. Colaborador pode ou nao ter conta de login vinculada.

## Lancamento de ficha tempo

1. Selecionar projeto e colaborador do mesmo tenant.
2. Lancar datas e jornadas.
3. Calcular custo por regras vigentes.
4. Salvar entradas com rastreabilidade.

## Administracao global da plataforma

1. Papel global pode visualizar dados de todas organizacoes.
2. Acesso global deve ser restrito, logado e auditavel.
3. Escopo funcional exato permanece PENDENTE.
