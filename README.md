# 🍰 Sistema Multi-Tenant de Confeitaria

Plataforma completa para múltiplas confeitarias gerenciarem seus cardápios independentes e receberem pedidos via WhatsApp.

## ✨ Sistema Multi-Tenant

Cada confeitaria tem seu próprio painel administrativo totalmente isolado:
- **URL única**: `https://meusite.lovable.app/nomedaloja/admin`
- **Dados isolados**: Cada usuária vê apenas seus produtos e configurações
- **Segurança**: Row Level Security (RLS) garante isolamento total

## 🚀 Recursos Principais

### Para Confeiteiras (Admin)
- ✅ Painel administrativo exclusivo com autenticação
- ✅ Gerenciamento completo de produtos com imagens
- ✅ Customização de cores e marca
- ✅ Organização por seções (Bolos, Doces, etc)
- ✅ Configuração de WhatsApp para pedidos
- ✅ Site público automático em `/:slug`

### Para Clientes (Público)
- ✅ Navegação por categorias de produtos
- ✅ Carrinho de compras intuitivo
- ✅ Envio de pedido direto para WhatsApp
- ✅ Interface responsiva (mobile + desktop)

## 📋 Configuração Inicial

### 1. Executar Migration SQL

Antes de usar o sistema, execute a migration multi-tenant no Supabase:

1. Acesse o [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql)
2. Abra o arquivo `SUPABASE_MULTITENANT_MIGRATION.sql`
3. Copie e execute todo o conteúdo
4. Verifique se não há erros no console

**O que a migration faz:**
- Adiciona `user_id` nas tabelas (se não existir)
- Habilita Row Level Security (RLS)
- Cria policies de acesso isoladas por usuário
- Adiciona índices para performance

### 2. Criar uma Confeitaria

1. Acesse `https://meusite.lovable.app/`
2. Preencha:
   - Nome da confeitaria
   - Slug único (ex: "docesdaluna")
   - Email e senha
3. Clique em **"Criar Conta"**

### 3. Acessar o Painel Admin

Após criar a conta, acesse:
```
https://meusite.lovable.app/docesdaluna/admin
```

Ou simplesmente `/admin` - o sistema redireciona automaticamente para `/:slug/admin`.

### 4. Configurar WhatsApp

No painel admin → **Config**:
1. Adicione o número com código do país (ex: 5511999999999)
2. Configure a mensagem padrão de pedido
3. Salve as alterações

### 5. Adicionar Produtos

No painel admin → **Produtos**:
1. Clique em **"Novo Produto"**
2. Preencha nome, descrição e preço
3. Faça upload de imagens
4. Adicione tamanhos/variações se necessário
5. Salve

### 6. Organizar Seções

No painel admin → **Seções**:
1. Crie seções (ex: "Bolos", "Doces", "Salgados")
2. Arraste produtos para as seções
3. Reordene conforme preferência

### 7. Personalizar Aparência

No painel admin → **Cores**:
- Defina cor de fundo
- Defina cor dos botões

No painel admin → **Marca**:
- Faça upload do logo
- Customize hero section
- Configure textos

## 🏗️ Estrutura do Projeto

```
/                          → Cadastro de nova confeitaria
/:slug                     → Site público da confeitaria
/:slug/admin               → Painel administrativo (protegido)
```

## 🔒 Segurança

### Row Level Security (RLS)

Todas as tabelas têm políticas de segurança:

**Bakeries (Confeitarias)**
- ✅ Público pode ler (para exibir sites)
- ✅ Usuário pode criar sua própria confeitaria
- ✅ Apenas o dono pode atualizar/deletar

**Products, Extras, Sections, Tags**
- ✅ Público pode ler (para exibir no site)
- ✅ Apenas o dono da confeitaria vinculada pode criar/atualizar/deletar

### Validação de Acesso

O sistema valida:
1. Usuário está autenticado
2. Slug pertence ao usuário logado
3. Operações são feitas apenas nos próprios dados

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Roteamento**: React Router
- **State Management**: React Hooks
- **Integração**: WhatsApp Web API

## 📱 Fluxo de Pedido

1. Cliente navega no site público (`/:slug`)
2. Adiciona produtos ao carrinho
3. Clica em **"Finalizar Pedido"**
4. Preenche nome, telefone e observações
5. Clica em **"Enviar Pedido"**
6. WhatsApp abre com mensagem formatada:
   ```
   Olá! Gostaria de confirmar meu pedido:
   
   👤 Nome: Maria Silva
   📱 Telefone: (11) 99999-9999
   
   🧁 Pedido:
   • Bolo de Chocolate - R$ 45,00
   • Brigadeiro Gourmet (x12) - R$ 30,00
   
   Total: R$ 75,00
   
   📝 Observações:
   Entregar às 15h
   ```

## 🐛 Troubleshooting

### Erro: "Confeitaria não encontrada"
- ✅ Execute a migration SQL novamente
- ✅ Verifique se o `user_id` foi preenchido no banco
- ✅ Confirme que o slug existe

### Erro: "Acesso negado"
- ✅ Você está tentando acessar uma confeitaria de outro usuário
- ✅ Faça login com a conta correta
- ✅ Verifique o slug na URL

### Produtos não aparecem no site
- ✅ Confirme que as RLS policies foram criadas
- ✅ Verifique se os produtos têm `bakery_id` correto
- ✅ Teste uma query direta no Supabase

### WhatsApp não abre
- ✅ Verifique o formato do número (sem espaços, com código do país)
- ✅ Limpe o cache do navegador
- ✅ Teste em outro navegador/dispositivo

## 📚 Documentação Adicional

- [MULTI_TENANT_SETUP.md](MULTI_TENANT_SETUP.md) - Guia completo de configuração
- [SUPABASE_MULTITENANT_MIGRATION.sql](SUPABASE_MULTITENANT_MIGRATION.sql) - Migration SQL
- [Lovable Documentation](https://docs.lovable.dev)
- [Supabase RLS Docs](https://supabase.com/docs/guides/auth/row-level-security)

## 🚀 Deploy

### Via Lovable
1. Abra o [projeto no Lovable](https://lovable.dev/projects/c273bbd7-3a44-4f24-b902-ef61db5275fe)
2. Clique em **Share → Publish**
3. Aguarde o deploy automático

### Domínio Customizado
1. Vá em **Project → Settings → Domains**
2. Clique em **Connect Domain**
3. Siga as instruções para configurar DNS
4. Aguarde propagação (até 48h)

[Leia mais sobre domínios customizados](https://docs.lovable.dev/features/custom-domain)

## 💻 Desenvolvimento Local

```bash
# Clone o repositório
git clone <YOUR_GIT_URL>

# Entre no diretório
cd <YOUR_PROJECT_NAME>

# Instale dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse: `http://localhost:5173`

## 📝 Licença

Este projeto foi criado com [Lovable](https://lovable.dev).

## 🤝 Contribuindo

Contribuições são bem-vindas! Para mudanças importantes:
1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📞 Suporte

- [Documentação Lovable](https://docs.lovable.dev)
- [Discord da Comunidade](https://discord.com/channels/1119885301872070706/1280461670979993613)
- [Supabase Support](https://supabase.com/support)

---

**Feito com ❤️ usando [Lovable](https://lovable.dev)**
