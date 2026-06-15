# ADR-0006 - Reformulação dos Papéis de Acesso e Permissões do Tenant

- Status: APROVADO
- Data: 2026-06-15
- Origem: Feedback do cliente (Fábio Mineiro) via WhatsApp

## Contexto

Atualmente, o sistema expõe no seletor de papéis de acesso ("Papel de Acesso") as opções padrão de banco de dados: `Dono (Owner)`, `Administrador`, `Editor` e `Visualizador`.

A terminologia atual gera confusão conceitual e expõe permissões administrativas críticas (como o papel de `Dono` raiz) de maneira desnecessária. Além disso, há necessidade de segmentar os privilégios do papel `Editor` entre usuários que podem visualizar valores financeiros (como custo de folha, taxas e salários) e usuários que realizam apenas lançamentos operacionais na Ficha de Tempo.

## Decisão Proposta

1. **Remoção do Papel "Dono" do Dropdown de Seleção**:
   * O papel `Dono (Owner)` deve ser ocultado da listagem de seleção de criação e edição de usuários.
   * O papel de Dono continuará existindo internamente como a "conta pai/raiz" (responsável pela assinatura e faturamento do tenant), mas não pode ser atribuído ou editado por administradores comuns.

2. **Novas Nomenclaturas e Níveis de Acesso (Mapeamento de Editor)**:
   * O papel `Editor` do banco de dados será segmentado e mapeado na interface em duas opções distintas:
     * **"Gestor"**: Possui privilégios de edição e **pode visualizar valores** (financeiro, salários, custos, faturamento).
     * **"Apenas lançamentos"**: Possui privilégios de preencher a Ficha de Tempo, mas **não visualiza valores** (valores financeiros, salários dos funcionários, custos totais do projeto).
   * O papel `Visualizador (Viewer)` continua ativo para acesso de leitura.

3. **Salvaguarda de Segurança (Garantia de Administrador)**:
   * Deve ser implementada uma regra para garantir que cada Organização (tenant) possua **pelo menos 1 conta ativa com papel de Administrador** para evitar que a organização fique sem controle gerencial (independente do papel de Dono).

## Consequências e Impacto

* **Frontend (UI)**:
  * O dropdown de seleção de papéis exibirá:
    * `Administrador`
    * `Gestor (visualiza valores)`
    * `Apenas lançamentos (não visualiza valores)`
    * `Visualizador`
* **Backend & Segurança**:
  * As APIs que expõem custos salariais, orçamentos de propostas e resumos de custos nas fichas de tempo deverão validar se o usuário possui permissão de visualização de valores (ou seja, se possui papel `OWNER`, `ADMIN` ou `Editor` com flag/tipo de visualização ativa).
  * Usuários com papel de "Apenas lançamentos" terão dados financeiros omitidos (ofuscados ou zerados) nas respostas das APIs de projetos e ficha de tempo.
