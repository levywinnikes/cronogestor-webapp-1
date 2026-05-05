# Regras de Negocio

## Principios

1. O sistema e multi-tenant por organizacao.
2. Dados de uma organizacao nao podem vazar para outra.
3. Existe a necessidade de um papel global da Cronogestor com visao total (ainda pendente de definicao detalhada).

## Organizacao e usuarios

1. Criar organizacao deve criar usuario inicial automaticamente.
2. Cada organizacao possui propria lista de usuarios.
3. Usuarios administrativos da organizacao gerenciam seus projetos e colaboradores.
4. Papel global da plataforma deve ter acesso cross-tenant controlado e auditavel.

## Projetos

1. Projeto pertence a uma organizacao.
2. Campos esperados pelas telas:
   - nome
   - responsavel
   - tipo de contrato
   - contratante
   - data de inicio
   - previsao de termino
   - custo previsto
   - numero de contrato
   - status
   - endereco
   - flag de lista de tarefas

3. Status padrao sugerido: EM_ANDAMENTO (de acordo com UX atual).

## Funcionarios

1. Funcionario pertence a uma organizacao.
2. Campos de custo esperados:
   - salario
   - regime
   - horas por dia
   - encargos
   - beneficios

3. Documento do funcionario deve ser unico no contexto da organizacao.

## Ficha tempo

1. Lancamento e feito por colaborador e projeto.
2. Regras de calculo atuais incluem:
   - horas normais
   - extra 50
   - extra 100
   - adicional noturno (planejado)

3. Todo lancamento deve respeitar o tenant da organizacao.

## Seguranca e compliance

1. Nunca versionar credenciais e segredos.
2. Evitar mensagens de erro que exponham dados sensiveis.
3. Acoes administrativas globais devem gerar trilha de auditoria.
