# Checklist de Atualizacao da Base IA

## Quando abrir PR ou mudar funcionalidade

1. Releia docs/ai/README.md.
2. Confirme se alguma regra de negocio mudou.
3. Confirme se alguma entidade/relacao mudou.
4. Confirme se algum fluxo de usuario mudou.
5. Confirme se alguma diretriz tecnica mudou.
6. Atualize docs/ai/adr/README.md e crie/edite ADRs para pendencias e decisoes.

## Gate de qualidade

1. Codigo e docs descrevem o mesmo comportamento.
2. Nao ha contradicao entre arquivos de docs/ai.
3. Mudancas de seguranca e acesso foram documentadas.

## Regra simples

Se mudou o sistema e nao mudou docs/ai, a mudanca esta incompleta.
