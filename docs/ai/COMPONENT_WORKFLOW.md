# Component Workflow Checklist

## Checklist Obrigatorio Antes de Alterar Codigo

1. Ler `AGENTS.md` e `docs/ai/README.md`.
2. Ler este arquivo e `docs/ai/COMPONENT_CATALOG.md`.
3. Verificar se ja existe componente equivalente em:
   - `components/ui`
   - `features/<feature>`
4. Verificar tokens de tema em `app/globals.css` antes de criar novas cores.
5. Verificar se textos novos podem ser implementados via chave de traducao.

## Regras de Implementacao

1. Nao duplicar JSX de formularios: extrair para componente/hook.
2. Nao duplicar regras de validacao: extrair para schema em arquivo proprio.
3. Nao duplicar funcoes de formatacao: extrair para utilitario.
4. Preferir nomeacao por responsabilidade:
   - `*Screen` para tela
   - `*Card`, `*Grid`, `*Form` para blocos de UI
   - `use*` para hooks

## Feedback ao Usuario (Toast)

1. **Obrigatorio**: usar `useAppToast()` de `lib/use-app-toast.ts` para sucesso, erro, aviso e info apos operacoes (salvar, excluir, falha de API, convite enviado, etc.).
2. **Proibido**: banners inline na pagina (`successMsg`, `errorMsg`, `bg-green-50`, `bg-red-50`, `bg-danger-100` como feedback de operacao).
3. **Excecao**: validacao contextual no proprio formulario/modal que impede envio (ex.: overlap de horarios no formulario de ficha tempo) pode permanecer inline no formulario.
4. Atalhos comuns: `appToast.saved()`, `appToast.deleted()`, `appToast.fromUnknownError(error, "chave.i18n.fallback")`.

## Regras de Pastas

1. Rotas em `app/**/page.tsx` devem ser wrappers minimos.
2. Codigo de negocio e UI da feature deve ficar em `features/<feature>`.
3. Componentes globais e agnosticos devem ficar em `components/ui`.

## Pos-Alteracao

1. Atualizar `docs/ai/COMPONENT_CATALOG.md` se criou/moveu componente.
2. Rodar `npm run lint`.
3. Confirmar que nao houve duplicacao desnecessaria.
4. Registrar no catalogo props principais, variacoes de estado (loading/erro/vazio) e exemplos de reuso.
5. Nao considerar tarefa concluida sem atualizacao de documentacao do componente no mesmo PR/commit.
