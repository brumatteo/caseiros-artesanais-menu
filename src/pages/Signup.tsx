import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();
  const [confectioneryName, setConfectioneryName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const [generatedSlug, setGeneratedSlug] = useState('');

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!confectioneryName.trim() || !email.trim() || !password.trim()) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Erro',
        description: 'A senha deve ter no mínimo 6 caracteres',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    const slug = generateSlug(confectioneryName);

    try {
      // Check if slug already exists
      const { data: existingBakery } = await supabase
        .from('bakeries')
        .select('slug')
        .eq('slug', slug)
        .maybeSingle();

      if (existingBakery) {
        toast({
          title: 'Erro',
          description: 'Já existe uma confeitaria com esse nome. Tente outro.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // Sign up the user
      console.log('🔐 Criando usuário no Auth...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
        },
      });

      if (authError) {
        console.error('❌ Erro no Auth:', authError);
        toast({
          title: 'Erro ao criar conta',
          description: authError.message,
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        console.error('❌ Usuário não foi criado');
        toast({
          title: 'Erro',
          description: 'Não foi possível criar a conta',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      console.log('✅ Usuário criado:', authData.user.id);
      console.log('📝 Criando registro na tabela bakeries...');

      // Manually create bakery entry with explicit user_id
      const bakeryData = {
        user_id: authData.user.id,
        confectionery_name: confectioneryName,
        slug: slug,
      };
      
      console.log('📦 Dados para inserir:', bakeryData);

      const { data: bakeryResult, error: bakeryError } = await supabase
        .from('bakeries')
        .insert(bakeryData)
        .select();

      if (bakeryError) {
        console.error('❌ Erro ao criar bakery:', bakeryError);
        console.error('Detalhes:', JSON.stringify(bakeryError, null, 2));
        toast({
          title: 'Erro ao criar confeitaria',
          description: bakeryError.message,
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      console.log('✅ Bakery criada:', bakeryResult);

      setGeneratedSlug(slug);
      setShowLink(true);
      
      toast({
        title: 'Conta criada com sucesso!',
        description: 'Redirecionando para o painel...',
      });

      // Redirect after a moment
      setTimeout(() => {
        navigate('/admin');
      }, 1500);
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao criar a conta. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (showLink) {
    const fullLink = `${window.location.origin}/${generatedSlug}`;
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
        <div className="max-w-md w-full bg-card border rounded-lg p-8 shadow-lg">
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-display font-bold">Conta criada!</h2>
            <p className="text-muted-foreground">
              Seu link único foi criado com sucesso:
            </p>
            <div className="bg-muted p-4 rounded-md break-all">
              <a 
                href={`/${generatedSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                {fullLink}
              </a>
            </div>
            <p className="text-sm text-muted-foreground">
              Redirecionando para o painel de administração...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <div className="max-w-md w-full bg-card border rounded-lg p-8 shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">
            Crie sua Confeitaria Online
          </h1>
          <p className="text-muted-foreground">
            Seu cardápio digital em minutos
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">
              Nome da Confeitaria
            </label>
            <Input
              type="text"
              value={confectioneryName}
              onChange={(e) => setConfectioneryName(e.target.value)}
              placeholder="Ex: Doces da Maria"
              disabled={isLoading}
              required
            />
            {confectioneryName && (
              <p className="text-xs text-muted-foreground mt-1">
                Seu link será: /{generateSlug(confectioneryName)}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Senha</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              disabled={isLoading}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando conta...
              </>
            ) : (
              'Criar minha conta'
            )}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="text-sm text-primary hover:underline"
            >
              Já tenho uma conta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
