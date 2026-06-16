# ADR-0007 - Ajuda de Campos (Tooltips), Notificações Globais, Segurança de Sessão e Ajustes Operacionais

- Status: APROVADO
- Data: 2026-06-16
- Origem: Solicitação do usuário e melhorias de UX/Segurança

## Contexto

A experiência do usuário (UX) nas telas de Ficha de Tempo e de Cadastro de Funcionários precisava de mais robustez e clareza. Além disso, foram identificados problemas de queda silenciosa de sessão de usuário (onde a UI continuava aberta sem redirecionamento) e a necessidade de um sistema padronizado de feedback visual imediato (toasts) e documentação contextual/ajuda de campos.

## Decisões

1. **Documentação Contextual nos Campos (Help Tooltips)**:
   * Regra petrea: Todo campo de formulário do sistema deve exibir obrigatoriamente um ícone de interrogação/ajuda (`<InfoTooltip />`) posicionado ao final de sua label.
   * O texto descritivo do tooltip deve vir exclusivamente de arquivos de tradução i18n (`locales/<lang>/common.json`).

2. **Sistema de Notificações (Toaster)**:
   * Desenvolvido um componente de toast customizado e dinâmico (`components/ui/toast.tsx`) e injetado globalmente na raiz do layout (`app/layout.tsx`).
   * Fornece métodos imperativos simples (`toast.success`, `toast.error`, `toast.warning`, `toast.info`) baseados em eventos CustomEvent para comunicação entre componentes client-side sem dependência de bibliotecas pesadas de terceiros.

3. **Segurança de Sessão e Redirecionamento 401**:
   * Renomeado `proxy.ts` para `middleware.ts` para que o Next.js intercepte nativamente requisições HTTP e impeça transições de rotas caso o cookie de sessão seja inválido.
   * Injetado um interceptador global de `fetch` no `AppI18nProvider.tsx` para monitorar todas as chamadas de API do cliente. Qualquer resposta HTTP 401 (não autorizado) causa um redirecionamento imediato para a tela de `/login`.

4. **Operações na Ficha de Tempo**:
   * O filtro de colaborador agora inclui uma opção "Todos" (com `employeeId = "all"` resolvido no backend Prisma), permitindo visualização integrada dos lançamentos de todos os funcionários de um projeto.
   * Removido o botão de salvamento manual ("Salvar Ficha") e habilitado o salvamento automático (auto-save) em todas as interações.
   * Inserido o botão "+ Ficha Tempo" de forma permanente no Header global para agilizar o lançamento a partir de qualquer ponto do sistema.

5. **Simplificação e Validação no Cadastro de Funcionários**:
   * Remoção dos campos redundantes "Nome Completo" (unificado com Nome) e "Vale Transporte".
   * Divisão do campo "Título de Eleitor" em três campos distintos no banco/formulário: "Número", "Zona" e "Seção".
   * Adicionada seleção de "Tipo de Documento" (CPF vs. Outros) com aplicação de máscara de formatação (`999.999.999-99`) e validação de algoritmo de CPF ativa apenas quando CPF estiver selecionado.
   * Botão "Novo" garante a limpeza completa de todos os campos da tela (incluindo endereços e dados secundários).

## Consequências e Impacto

* **Padrões de Engenharia**: Atualização no `ENGINEERING_RULES.md` adicionando a regra de tooltips.
* **Component Catalog**: Registro de `<ToastContainer />` e `toast` como utilitário global e reuso do `<InfoTooltip />`.
* **Segurança**: Resiliência de sessão aprimorada sem dependência de pooling manual no cliente.
