# ADR-0004 - Múltiplos Intervalos e Simplificação de Data na Ficha de Tempo

- Status: APROVADO
- Data: 2026-06-15
- Origem: Ata de reunião 2026-05-26 (Prioridade Média)

## Contexto

A Ficha de Tempo (Timesheet) atualmente permite apenas um único intervalo de entrada/saída por dia, com um desconto fixo de minutos de intervalo. No entanto, em obras e operações do mundo real, colaboradores frequentemente realizam jornadas com múltiplos turnos (ex: entrada pela manhã, saída para almoço, retorno à tarde e hora extra noturna em turno separado). Adicionalmente, as seleções redundantes de Mês e Ano de forma isolada na interface poluem o cabeçalho e criam atrito para o usuário.

## Decisão Proposta

1. **Estrutura de Banco de Dados**:
   - Adicionar opcionalmente mais dois intervalos de entrada/saída (`startDateTime2`/`endDateTime2` e `startDateTime3`/`endDateTime3`) na entidade `TimeSheetEntry`.
   - Manter o campo `breakMinutes` associado ao dia/primeiro intervalo para deduções tradicionais (como horário de almoço).

2. **Cálculo de Horas Trabalhadas e Custo**:
   - O total trabalhado no dia será a soma das horas de todos os intervalos válidos preenchidos, subtraindo os minutos de descanso (`breakMinutes`) do primeiro intervalo.
   - O limite diário de jornada normal do colaborador será validado contra a soma total das horas trabalhadas no dia. O excedente será classificado como hora extra (50% ou 100%).

3. **Validação de Sobreposição**:
   - A verificação de overlap passará a validar se os intervalos preenchidos no mesmo dia não se sobrepõem entre si (ex: Intervalo 1 não pode colidir com Intervalo 2) e se não colidem com outros registros do mesmo colaborador.

4. **Simplificação de UX (Modal para Lançamento e Edição)**:
   - Remover completamente os seletores de Mês e Ano do topo da tela. A seleção de período será inferida automaticamente a partir das datas dos lançamentos.
   - **Tabela Somente Leitura**: As linhas da tabela principal exibirão os registros de forma limpa e fechada (sem inputs inline).
   - **Modal Unificado**: Toda criação ("Adicionar ficha tempo") e edição (botão "Editar" na linha) abrirá um modal dedicado contendo o campo de data, os campos de intervalos (com suporte a até 3 turnos) e minutos de descanso.
   - **Validação no Modal**: Alertas de conflito e sobreposição serão validados dinamicamente dentro do próprio modal.

## Consequências e Impacto

- **Lógica de Salvamento e Consulta**:
  - Na consulta (`GET`), o backend retornará por padrão as fichas do mês atual, ou com base em um filtro de intervalo implícito.
  - No salvamento (`POST`), o backend agrupará as entradas por ano e mês com base no `workDate` de cada uma delas, criando ou atualizando as respectivas `TimeSheet` de forma transparente.
- **Migração de Banco de Dados**: Será necessária uma migração de banco de dados (`npx prisma migrate dev`) para adicionar as novas colunas à tabela `TimeSheetEntry`.
- **Compatibilidade**: Os registros existentes continuarão funcionando normalmente, pois os novos campos são opcionais (`nullable`).
- **Performance**: A validação de sobreposição no backend será ligeiramente mais complexa, mas executada rapidamente em memória antes do salvamento.
