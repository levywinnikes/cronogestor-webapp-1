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
5. Email de login e unico no sistema (escopo global), nao por organizacao.
6. Tenant pode ser PF ou PJ e ambos seguem o mesmo fluxo de projetos.

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
4. Numero/codigo de projeto deve ser unico no tenant para sempre (sem reset anual).

## Propostas e calculo

1. Consolidados de custo devem ser recalculados sob demanda a partir dos itens de entrada.
2. Enquanto o calculo for sob demanda, nao ha obrigacao de snapshot persistido de resumo.

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
3. O intervalo/descanso não possui campo de digitação manual. Ele é calculado automaticamente pela diferença (gargalo) entre a saída de um turno e a entrada do turno seguinte.
4. O sistema suporta até 4 turnos (Entradas/Saídas) diários, calculando a soma líquida de horas trabalhadas e os intervalos entre eles.
5. Todo lancamento deve respeitar o tenant da organizacao.

## Seguranca e compliance

1. Nunca versionar credenciais e segredos.
2. Evitar mensagens de erro que exponham dados sensiveis.
3. Acoes administrativas globais devem gerar trilha de auditoria.
