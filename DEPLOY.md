# Deploy Instructions (Vercel + GitHub)

## Processo de Deploy

O deploy da aplicação é automático na Vercel sempre que houver commit e push para a branch de produção configurada no projeto.

Fluxo recomendado:

1. Fazer stage dos arquivos alterados.
2. Criar commit com mensagem clara.
3. Realizar push para a branch de deploy.
4. Acompanhar build e runtime na Vercel.

## Segurança de Credenciais

Boas práticas obrigatórias:

1. Nunca versionar tokens, senhas, connection strings ou chaves privadas em arquivos do repositório.
2. Nunca embutir PAT em URL de remote Git salva no projeto.
3. Usar autenticação segura via Git Credential Manager ou variáveis de ambiente locais.
4. Manter credenciais apenas em `.env` local e no painel de variáveis da Vercel.
5. Em caso de vazamento, revogar e rotacionar o segredo imediatamente.

## Checklist de Produção

1. Variáveis de ambiente configuradas no ambiente de produção.
2. Banco de dados acessível com TLS habilitado.
3. Migrações aplicadas com `prisma migrate deploy`.
4. Logs e monitoramento ativos para erro de autenticação e conexão.
