# Regras de Engenharia

## Banco e Prisma

1. Usar Prisma como camada de acesso principal.
2. Nao introduzir SQL sem necessidade clara.
3. Toda mudanca de modelo deve ter migration ou justificativa documentada.

## Multi-tenant

1. Garantir organizationId em entidades de negocio.
2. Garantir filtro por tenant em repositorios/queries.
3. Testar cenarios de isolamento de dados.
4. Endpoints protegidos devem validar sessao + membership ativa via guard server-side reutilizavel.

## Seguranca

1. Nao commitar segredos, tokens, PAT ou senhas.
2. Usar variaveis de ambiente e provedores seguros.
3. Registrar riscos e decisoes em docs/ai/adr.
4. Sessao web deve usar cookies HTTP-only para access/refresh token.
5. Refresh token deve ser persistido por hash e rotacionado a cada renovacao de sessao.
6. Logout deve revogar sessao persistida no servidor.

## Qualidade

1. Preferir tipagem explicita em entradas de dominio.
2. Evitar regras de negocio em componentes de UI.
3. Centralizar regras em camada de servico/dominio.
4. Incluir validacoes de entrada no backend.
5. Evitar duplicacao de componentes; verificar catalogo antes de criar novo.
6. Rotas em app devem ser wrappers minimos; logica e UI em features.
7. Cores semanticas devem usar design tokens (globals.css) e nao hex repetido. NUNCA usar hardcoded hex colors como `bg-[#002f5c]`, usar `bg-primary`.
8. Texto novo de UI deve priorizar chave de traducao (i18n).
9. NUNCA criar lógicas, callbacks ou variáveis com tipagem implícita (ex: `any` implícito) que possam quebrar a compilação no modo estrito. A I.A. deve assegurar que o código gerado compile com sucesso no Vercel (`next build` e `tsc --noEmit`).
10. UI/UX: Sempre usar `<TextField>`, `<SelectField>`, `<TextareaField>` para formulários — NUNCA `<input>` ou `<select>` nativo.
11. UI/UX: Sempre usar `<AppButton>` para botões — NUNCA `<button>` nativo com classes inline gigantes.
12. UI/UX: Sempre usar `<Card>` para agrupar seções na tela e `<PageHeader>` para o cabeçalho das páginas.
13. UI/UX: Sempre usar `<Badge>` para estados (Status) e `<EmptyState>` quando não há registros na tela.
14. React: Sempre garanta que formulários e inputs controlados não recebam `undefined` ou `null` da API. Use fallback `?? ""` ou `|| 0` em DTOs/mappers para evitar o erro "A component is changing a controlled input to be uncontrolled".
15. Next.js/UX: Navegação entre páginas sempre deve ter feedback visual imediato. Use o arquivo `app/loading.tsx` na raiz ou em sub-rotas pesadas para exibir uma tela de loading genérica enquanto o servidor resolve os dados da próxima página.
16. UI/UX: Para carregamento de dados em telas/blocos específicos, SEMPRE utilize o padrão **Skeleton Loading** (ofuscamento com efeito _pulse_ via componente `<Skeleton />`) simulando a estrutura original da UI. Evite spinners de tela cheia ou textos simples como "Carregando..." para carregamentos de dados em blocos específicos.
17. Tratamento de Erros: NUNCA retorne ou exiba mensagens de erro genéricas ou ambíguas (ex.: "Erro ao registrar. Tente novamente.") quando a causa real for identificável (como e-mail em uso, CPF/CNPJ duplicado ou validação falha). O backend deve retornar códigos HTTP semânticos (ex.: 409 Conflict, 400 Bad Request) e mensagens claras. O frontend deve repassar e renderizar estas mensagens reais do backend para o usuário.
18. UI/UX — Feedback de operações: SEMPRE usar o utilitário global de toast (`lib/use-app-toast.ts` → `useAppToast()` ou `toast` de `components/ui/toast.tsx`) para sucesso, erro, aviso e informação após ações do usuário (salvar, excluir, convidar, falha de API, etc.). NUNCA criar banners inline na página (`bg-green-50`, `bg-red-50`, `successMsg`/`errorMsg` locais). Exceção: erros de validação contextual no próprio formulário/modal que impedem o envio (ex.: overlap de horários no formulário de ficha tempo) podem permanecer inline no formulário.
44. UI/UX: Todo campo de formulário do sistema deve incluir um ícone de interrogação/ajuda explicativo (utilizando o componente `<InfoTooltip />` posicionado obrigatoriamente no final da label do campo). O texto explicativo do tooltip deve vir exclusivamente dos arquivos de tradução (i18n).

## Documentacao viva

1. Mudou regra de negocio: atualizar BUSINESS_RULES.md.
2. Mudou entidade ou relacao: atualizar DOMAIN_MODEL.md.
3. Mudou fluxo funcional: atualizar WORKFLOWS.md.
4. Mudou diretriz tecnica: atualizar ENGINEERING_RULES.md.
5. Toda implementacao nova deve nascer com documentacao previa (escopo, criterio de aceite, impacto multi-tenant e plano tecnico) em docs/ai antes de editar codigo.
6. Itens de roadmap oriundos de ata/issue devem ser registrados em NEXT_STEPS.md com status e dono.
