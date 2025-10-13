# 🚀 GUIA COMPLETO DE SETUP

## ✅ O QUE FOI CORRIGIDO

Corrigi o erro crítico que impedia o salvamento no Supabase:

**PROBLEMA:** O código estava usando `Date.now()` (ex: 1760324205535) para gerar IDs e valores de `order`, mas esses números são muito grandes para o tipo `integer` do PostgreSQL (limite: -2147483648 a 2147483647).

**SOLUÇÃO:** 
- IDs agora usam strings curtas aleatórias (ex: `prod_a3x7k9m`)
- Orders agora usam valores sequenciais pequenos (0, 1, 2, 3...)
- Logs detalhados para debug em todos os passos

---

## 📋 PASSO A PASSO PARA CONFIGURAR

### 1️⃣ EXECUTAR MIGRAÇÃO NO SUPABASE

1. Acesse seu projeto no Supabase: https://supabase.com/dashboard
2. Clique em **SQL Editor** (no menu lateral esquerdo)
3. Clique em **+ New query**
4. Cole TODO o conteúdo do arquivo `SUPABASE_FIX_MIGRATION.sql`
5. Clique em **Run** (ou pressione Ctrl+Enter)
6. Aguarde a mensagem de sucesso ✅

**O QUE ESTA MIGRAÇÃO FAZ:**
- ✅ Adiciona coluna `settings` (JSONB) em `bakeries`
- ✅ Adiciona colunas `sizes`, `tags`, `show_image`, `product_order` em `products`
- ✅ Cria tabelas `extras`, `sections`, `tags`
- ✅ Configura RLS (Row Level Security) para proteger os dados
- ✅ Cria índices para melhor performance

---

### 2️⃣ TESTAR O SALVAMENTO

1. Faça login no painel admin (/admin)
2. Abra o **Console do navegador** (F12 ou Ctrl+Shift+I)
3. Vá para a aba **Console**
4. Faça qualquer alteração no painel (nome da confeitaria, produtos, etc)
5. Clique em **"Salvar Alterações"**

**LOGS ESPERADOS NO CONSOLE:**

```
💾 Iniciando salvamento no Supabase... { bakeryId: '...', data: {...} }
✅ Bakery atualizada com sucesso
✅ Produtos antigos deletados
✅ 3 produtos inseridos
✅ Extras antigos deletados
✅ 2 extras inseridos
✅ Sections antigas deletadas
✅ 1 sections inseridas
✅ Tags antigas deletadas
✅ Todos os dados salvos com sucesso no Supabase!
```

**SE DER ERRO:**
- Copie o erro completo do console
- Verifique se a migração foi executada corretamente
- Verifique se as tabelas foram criadas no Supabase (Table Editor)

---

### 3️⃣ VERIFICAR NO SUPABASE

1. No Supabase, vá para **Table Editor**
2. Verifique as tabelas:
   - `bakeries` → deve ter a coluna `settings`
   - `products` → deve ter colunas `sizes`, `tags`, `show_image`, `product_order`
   - `extras` → nova tabela criada
   - `sections` → nova tabela criada
   - `tags` → nova tabela criada

3. Clique em cada tabela e verifique se os dados foram salvos

---

### 4️⃣ TESTAR O SITE PÚBLICO

1. Abra o site público: `/:slug` (ex: `/sabores`)
2. Os dados salvos devem aparecer!
3. Recarregue a página → os dados devem persistir

---

## 🔍 DEBUG: O QUE VERIFICAR SE NÃO FUNCIONAR

### Console Logs
Todos os passos do salvamento agora têm logs detalhados:
- `💾` = Início do salvamento
- `✅` = Sucesso em uma operação
- `❌` = Erro em uma operação

### Network Tab
1. Abra F12 → aba **Network**
2. Filtre por "supabase"
3. Ao salvar, você verá requisições PATCH/POST/DELETE
4. Clique em cada requisição para ver:
   - **Headers**: autenticação está correta?
   - **Payload**: dados sendo enviados estão corretos?
   - **Response**: erro ou sucesso?

### Table Editor
Verifique diretamente no Supabase se:
- Os dados estão sendo inseridos
- O `bakery_id` está correto
- O `user_id` em `bakeries` corresponde ao usuário logado

---

## 🎯 FLUXO COMPLETO DO SISTEMA

```
1. CADASTRO
   └─> Usuária cria conta (email + senha)
   └─> Sistema cria automaticamente uma bakery com slug único
   └─> user_id é associado à bakery

2. LOGIN
   └─> Usuária faz login
   └─> Sistema carrega a bakery dela
   └─> Carrega todos os dados (products, extras, sections, tags)

3. EDIÇÃO NO PAINEL
   └─> Usuária edita nome, produtos, cores, etc
   └─> Clica em "Salvar"
   └─> Dados são enviados para Supabase
   └─> Supabase valida RLS (usuária é dona da bakery?)
   └─> Se sim → SALVA
   └─> Se não → ERRO 403

4. SITE PÚBLICO
   └─> Visitante acessa /:slug
   └─> Sistema busca bakery pelo slug
   └─> Carrega todos os dados da bakery
   └─> Renderiza o site com os dados salvos

5. PERSISTÊNCIA
   └─> Dados ficam salvos no Supabase
   └─> Ao recarregar, dados são carregados novamente
   └─> Sem perda de informações!
```

---

## 🆘 PROBLEMAS COMUNS

### "Error: bakeryId is undefined"
- Verifique se o usuário tem uma bakery criada
- No console, execute: `localStorage.clear()` e faça login novamente

### "Error 403: Forbidden"
- RLS está bloqueando o acesso
- Verifique se `user_id` da bakery = `auth.uid()` do usuário

### "Error 500: value out of range"
- **RESOLVIDO** com esta atualização!
- Se ainda aparecer, verifique se a migração foi executada

### "Dados não persistem ao recarregar"
- Verifique os logs do console
- Verifique se o salvamento foi bem-sucedido
- Verifique no Table Editor do Supabase

---

## 📞 PRÓXIMOS PASSOS

Após configurar tudo:

1. ✅ Teste criar uma conta nova
2. ✅ Teste editar e salvar dados
3. ✅ Teste visualizar no site público
4. ✅ Teste com múltiplas alunas (contas diferentes)
5. ✅ Verifique se cada uma vê apenas seus próprios dados

---

## 🎉 ESTÁ PRONTO!

Se todos os testes passarem, o sistema está funcionando 100%! Cada aluna terá:
- ✅ Sua própria conta
- ✅ Seu próprio painel admin
- ✅ Seu próprio cardápio personalizado
- ✅ Seu próprio site público (/:slug)
- ✅ Dados persistentes no Supabase
- ✅ Isolamento total de dados (RLS)

**BOA SORTE NO LANÇAMENTO! 🚀**
