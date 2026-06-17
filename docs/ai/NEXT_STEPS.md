# Proximos Passos de Desenvolvimento

## Regra de execucao

1. Nenhum item desta lista pode entrar em implementacao sem documentacao previa alinhada em `docs/ai`.
2. Toda feature deve declarar: escopo, criterio de aceite, impacto multi-tenant, impacto i18n e componentes reutilizados/novos.
3. Todo componente novo deve ser registrado em `docs/ai/COMPONENT_CATALOG.md` no mesmo ciclo da entrega.

## Fonte

- Ata: 2026-05-26 - Reuniao 8
- Relator: Fabio
- Participantes: Andre, Fabio

## Backlog priorizado

### Prioridade Alta

1. Projeto: revisar formulario de criacao para tipo de contrato (contratante/contratada).
   - Status: CONCLUIDO
   - Criterio de aceite: campo de tipo de contrato deve refletir as opcoes definidas pelo produto e salvar corretamente no tenant ativo.

2. Projeto: anexos por plano (free x pago).
   - Status: IGNORADO (Requisito de Uploads excluído pelo usuário)
   - Criterio de aceite: plano gratuito limitado a 50MB por organizacao; plano pago sem limite funcional definido no app (respeitando limites tecnicos da infraestrutura).
   - Observacao: validar com seguranca e custo operacional antes da implementacao final.

3. Projeto: trocar campo unico de custo previsto por previsao detalhada.
   - Status: CONCLUIDO
   - Criterio de aceite: substituir "Custo Previsto da Obra" por campos separados de materiais, mao de obra e outros custos.

4. Funcionarios: jornada com horas e minutos + previa de custo/hora.
   - Status: CONCLUIDO
   - Criterio de aceite: permitir configuracao de jornada em formato de hora/minuto e exibir previa de hora normal e hora extra 50% com base no regime configurado.

5. Funcionarios: documentos e dados bancarios detalhados.
   - Status: CONCLUIDO (Sem Uploads)
   - Criterio de aceite:
     - separar agencia/conta com digito verificador
     - incluir campo de informacoes adicionais (Swift, iban, etc.)
     - permitir tipo de documento (cpf/cnpj/outros) com validacao quando for cpf

6. Ficha tempo: prevenir sobreposicao de lancamentos.
   - Status: CONCLUIDO
   - Criterio de aceite: bloquear lancamento com mesmo funcionario + mesmo projeto + intervalo de horario conflitante e retornar erro claro para usuario.

7. Ficha tempo: ajustes de UX de lancamento.
   - Status: CONCLUIDO
   - Criterio de aceite:
     - "Fechar ficha" -> "Salvar"
     - "Adicionar dia" -> "Adicionar ficha tempo"
     - "Projeto alvo" -> "Projeto"
     - apos salvar, limpar formulario para novo lancamento

8. Configuracoes: mover/organizar feriados dentro da area de configuracoes.
   - Status: CONCLUIDO
   - Criterio de aceite: cadastro e gestao de feriados acessiveis por menu de configuracoes com isolamento por tenant.

9. Dashboard/visao geral: previsto x realizado.
   - Status: CONCLUIDO
   - Criterio de aceite: exibir comparativo de horas e valores previstos versus realizados.

### Prioridade Media

1. Ficha tempo: permitir ate 3 intervalos no dia.
   - Status: CONCLUIDO
   - Criterio de aceite: campos de inicio/fim para multiplos intervalos, com terceiro intervalo opcional.

2. Ficha tempo: simplificar selecao de data.
   - Status: CONCLUIDO
   - Criterio de aceite: fluxo de lancamento orientado ao dia, removendo selecao redundante de mes/ano quando nao agregarem valor.

3. Configuracoes: cadastro e gestao de usuarios do tenant.
   - Status: PENDENTE
   - Criterio de aceite: disponibilizar na aba lateral de configuracoes um painel para listar, convidar, alterar permissoes e desativar membros da mesma instituicao (tenant) ativa.

4. Ficha tempo: conflito cross-project com divisao de horas.
   - Status: CONCLUIDO (ADR-0008)
   - Criterio de aceite:
     - detectar sobreposicao do mesmo funcionario no mesmo dia entre projetos diferentes;
     - dividir **somente minutos conflitantes** em partes iguais (1/N: 50/50, 33,33%, etc.);
     - exibir modal de confirmacao no save (projeto(s), faixa, horas conflitantes, preview efetivo);
     - exibir modal de impacto antes de excluir entry conflitante;
     - exibir flag de hora compartilhada na linha do lancamento; tooltip no hover com todos os projetos conflitantes;
     - recalcular custo com jornada diaria unificada (normal, extra 50/100, sabado, domingo, feriado);
     - persistir em transacao todos os lancamentos afetados do dia;
     - manter bloqueio de overlap dentro do mesmo projeto (sem split).
   - Documentacao: docs/ai/adr/ADR-0008-timesheet-cross-project-overlap-split.md

## Pendencias para decisao (antes de implementar)

1. Funcionarios: campo "Vale transporte" apareceu como incluir e remover na mesma ata.
   - Status: PENDENTE DE DECISAO
   - Acao: decidir regra oficial e registrar em BUSINESS_RULES.md.

2. Anexos em plano pago sem limite.
   - Status: PENDENTE DE DECISAO TECNICA
   - Acao: definir limite tecnico/operacional para evitar custo e risco de abuso.

## Governanca de componentes (obrigatorio)

1. Antes de criar componente, buscar equivalente no catalogo.
2. Se componente novo for necessario, registrar no catalogo com:
   - caminho
   - responsabilidade
   - props principais
   - estados (loading/erro/vazio)
   - telas que reutilizam
3. Se componente de feature passar a ser reutilizado, promover para `components/ui`.
