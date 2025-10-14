# 🏪 Sistema Multi-Tenant - Guia de Configuração

## ✅ O que foi implementado

O sistema agora suporta **múltiplas confeitarias totalmente isoladas**, onde cada usuária tem seu próprio painel administrativo com dados completamente independentes.

### Principais mudanças:

1. **Rotas dinâmicas por slug:**
   - Antes: `/admin` (compartilhado por todos)
   - Agora: `/:slug/admin` (único para cada confeitaria)
   - Exemplo: `https://meusite.lovable.app/docesdaluna/admin`

2. **Isolamento de dados por usuário:**
   - Cada confeitaria está vinculada ao `user_id` do dono
   - Produtos, seções, extras e tags são isolados por `bakery_id`
   - RLS (Row Level Security) garante que apenas o dono pode editar seus dados

3. **Controle de acesso:**
   - Apenas o usuário autenticado que criou a confeitaria pode acessar `/:slug/admin`
   - Tentativas de acesso não autorizado são bloqueadas
   - Redirecionamento automático após login

## 📋 Instruções de Configuração

### Passo 1: Executar a Migration SQL

1. Acesse o painel do Supabase
2. Vá em **SQL Editor**
3. Abra o arquivo `SUPABASE_MULTITENANT_MIGRATION.sql`
4. Copie todo o conteúdo e cole no editor SQL
5. Clique em **Run** para executar

**O que a migration faz:**
- Adiciona a coluna `user_id` na tabela `bakeries` (se não existir)
- Habilita RLS em todas as tabelas
- Cria policies para isolar dados por usuário
- Adiciona índices para melhor performance

### Passo 2: Testar o Sistema

#### Criar nova conta:
```
1. Acesse https://meusite.lovable.app/
2. Preencha os dados da confeitaria
3. Defina um slug único (ex: "docesdaluna")
4. Crie a conta
```

#### Acessar o painel:
```
Opção 1: Acesse diretamente https://meusite.lovable.app/docesdaluna/admin
Opção 2: Acesse /admin (será redirecionado automaticamente para /:slug/admin)
```

#### Ver o site público:
```
https://meusite.lovable.app/docesdaluna
```

### Passo 3: Verificar Isolamento

1. **Crie duas contas diferentes:**
   - Conta A: slug "confeitaria-a"
   - Conta B: slug "confeitaria-b"

2. **Teste o isolamento:**
   - Faça login na Conta A
   - Adicione produtos no painel de "confeitaria-a"
   - Faça logout e login na Conta B
   - Verifique que os produtos da Conta A não aparecem no painel da Conta B

3. **Teste o controle de acesso:**
   - Estando logado na Conta A
   - Tente acessar `/confeitaria-b/admin`
   - Deve aparecer "Acesso negado" e redirecionar

## 🔒 Segurança Implementada

### Row Level Security (RLS)

Todas as tabelas têm RLS ativado com as seguintes regras:

**Leitura (SELECT):**
- ✅ Público pode ver todas as confeitarias e produtos (para o site público)

**Escrita (INSERT/UPDATE/DELETE):**
- ✅ Apenas o dono (`user_id` = usuário autenticado) pode modificar sua confeitaria
- ✅ Produtos, extras, seções e tags só podem ser modificados pelo dono da confeitaria vinculada

### Validação no Frontend

O componente `Admin.tsx` valida:
1. Usuário está autenticado
2. Slug na URL corresponde a uma confeitaria do usuário
3. Se não houver slug, redireciona para `/:slug/admin` automaticamente

## 🎯 Fluxo de Uso

### Para a confeiteira (admin):
```
1. Cria conta em / com slug único
2. Acessa /meuslug/admin
3. Faz login (se não estiver logado)
4. Edita produtos, cores, informações
5. Clica em "Ver Site" para acessar /meuslug
6. Compartilha o link público com clientes
```

### Para a cliente (pública):
```
1. Acessa /meuslug (link compartilhado)
2. Visualiza produtos e cardápio
3. Adiciona ao carrinho
4. Clica em "Finalizar Pedido"
5. WhatsApp abre com pedido formatado
```

## ⚙️ Estrutura Técnica

### Tabelas e Relacionamentos:
```
auth.users (Supabase Auth)
    ↓ user_id
bakeries
    ↓ bakery_id
products, extras, sections, tags
```

### RLS Policies:
- `Public can read` - Permite leitura pública
- `Users can create for their bakery` - Criação apenas pelo dono
- `Users can update their own` - Atualização apenas pelo dono
- `Users can delete their own` - Deleção apenas pelo dono

## 🐛 Troubleshooting

### Erro: "Confeitaria não encontrada"
- Verifique se o slug existe no banco
- Confirme que o `user_id` está preenchido
- Execute a migration novamente

### Erro: "Acesso negado"
- Você está tentando acessar uma confeitaria que não é sua
- Faça login com a conta correta
- Verifique se o slug na URL está correto

### Produtos não aparecem
- Verifique se as RLS policies foram criadas
- Confirme que os produtos têm `bakery_id` preenchido
- Teste com uma query direta no Supabase

### Redirecionamento infinito
- Limpe o cache do navegador
- Verifique se o slug é único
- Confirme que `/admin` redireciona para `/:slug/admin`

## 📝 Notas Importantes

1. **Slugs devem ser únicos**: O sistema não permite duas confeitarias com o mesmo slug
2. **URLs antigas**: Se alguém acessar `/admin` diretamente, será redirecionado automaticamente
3. **Dados públicos**: Os sites públicos (`/:slug`) continuam acessíveis para todos
4. **Dados privados**: Painéis admin (`/:slug/admin`) são protegidos por autenticação e RLS

## 🚀 Próximos Passos

Após a configuração, você pode:
- [ ] Testar criação de múltiplas contas
- [ ] Verificar isolamento de dados
- [ ] Compartilhar links públicos
- [ ] Configurar domínio customizado
- [ ] Adicionar mais funcionalidades ao painel
