import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Loader2, Lock } from 'lucide-react';
import { AdminPanel } from '@/components/AdminPanel';
import { AppData } from '@/types';
import { useThemeColors } from '@/hooks/useThemeColors';
import { loadDataFromSupabase } from '@/lib/supabaseStorage';

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [data, setData] = useState<AppData | null>(null);
  const [userSlug, setUserSlug] = useState<string>('');
  const [bakeryId, setBakeryId] = useState<string>('');

  // Apply theme colors - call hook at top level
  useThemeColors(data?.settings || {} as any);

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      
      if (session?.user) {
        await loadUserData(session.user.id);
      }
      
      setIsCheckingAuth(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null);
      
      if (session?.user) {
        await loadUserData(session.user.id);
      } else {
        setData(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (userId: string) => {
    try {
      console.log('📥 Carregando dados do usuário...', { userId });
      
      // Fetch bakery info
      const { data: bakery, error: bakeryError } = await supabase
        .from('bakeries')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (bakeryError) {
        console.error('❌ Erro ao buscar bakery:', bakeryError);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar dados da confeitaria',
          variant: 'destructive',
        });
        return;
      }

      if (!bakery) {
        console.warn('⚠️ Confeitaria não encontrada para o usuário');
        toast({
          title: 'Confeitaria não encontrada',
          description: 'Por favor, complete o cadastro',
          variant: 'destructive',
        });
        return;
      }

      console.log('✅ Bakery encontrada:', bakery);
      setUserSlug(bakery.slug);
      setBakeryId(bakery.id);

      // Carregar dados completos do Supabase
      const appData = await loadDataFromSupabase(bakery.id);
      
      if (appData) {
        console.log('✅ Dados carregados com sucesso:', appData);
        setData(appData);
      } else {
        console.warn('⚠️ Nenhum dado encontrado, usando dados padrão');
        // Se não houver dados, criar estrutura padrão
        const defaultAppData: AppData = {
          settings: {
            brandName: bakery.confectionery_name,
            showLogo: false,
            showName: true,
            showHeroLogo: false,
            heroImagePosition: 'center',
            heroOverlayColor: '#000000',
            heroOverlayOpacity: 0.5,
            heroTitle: `Bem-vindo à ${bakery.confectionery_name}`,
            heroSubtitle: 'Doces artesanais feitos com carinho',
            whatsappNumber: '',
            whatsappMessage: 'Olá! Gostaria de fazer um pedido:',
            aboutTitle: 'Sobre Nós',
            aboutText: 'Somos uma confeitaria artesanal dedicada a criar doces deliciosos.',
            showAbout: true,
            extraInfoTitle: 'Informações Importantes',
            extraInfoText: 'Faça seu pedido com antecedência!',
            showExtraInfo: true,
            footerText: `© ${new Date().getFullYear()} ${bakery.confectionery_name}. Todos os direitos reservados.`,
            adminPassword: '',
          },
          products: [],
          sections: [],
          extras: [],
          tags: [],
        };
        setData(defaultAppData);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados do usuário:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar seus dados',
        variant: 'destructive',
      });
    }
  };


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: 'Erro ao fazer login',
          description: error.message === 'Invalid login credentials' 
            ? 'Email ou senha incorretos' 
            : error.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao fazer login',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: 'Sessão encerrada',
      description: 'Você saiu do painel administrativo.',
    });
    navigate('/');
  };

  const handleDataChange = async (newData: AppData) => {
    setData(newData);
  };

  const handleCloseAdmin = () => {
    navigate('/');
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
        <div className="max-w-md w-full bg-card border rounded-lg p-8 shadow-lg">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-primary/10 p-3 rounded-full">
              <Lock className="h-6 w-6 text-primary" />
            </div>
          </div>
          
          <h1 className="text-2xl font-display font-bold text-center mb-2">
            Painel Administrativo
          </h1>
          <p className="text-center text-muted-foreground mb-6">
            Faça login para gerenciar sua confeitaria
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
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
                placeholder="••••••"
                disabled={isLoading}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-sm text-primary hover:underline"
              >
                Criar uma conta
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AdminPanel
      isOpen={true}
      onClose={handleCloseAdmin}
      data={data}
      onDataChange={handleDataChange}
      onLogout={handleLogout}
      userSlug={userSlug}
      bakeryId={bakeryId}
    />
  );
};

export default Admin;
