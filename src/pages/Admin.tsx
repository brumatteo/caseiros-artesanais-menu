import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  const { slug } = useParams<{ slug?: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [data, setData] = useState<AppData | null>(null);
  const [userSlug, setUserSlug] = useState<string>('');
  const [bakeryId, setBakeryId] = useState<string>('');
  const [hasAccess, setHasAccess] = useState<boolean>(false);

  // Apply theme colors - call hook at top level
  useThemeColors(data?.settings || {} as any);

  useEffect(() => {
    let isMounted = true;

    // Check authentication status
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        // Se houver erro de token inválido/expirado, limpar sessão
        if (error) {
          console.warn('⚠️ Erro ao obter sessão:', error.message);
          await supabase.auth.signOut();
          if (isMounted) {
            setUser(null);
            setIsCheckingAuth(false);
          }
          return;
        }
        
        if (!isMounted) return;
        
        setUser(session?.user || null);
        
        if (session?.user) {
          await loadUserData(session.user.id);
        } else {
          setIsCheckingAuth(false);
        }
      } catch (error) {
        console.error('❌ Erro ao verificar autenticação:', error);
        if (isMounted) {
          setUser(null);
          setIsCheckingAuth(false);
        }
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event);
      
      if (!isMounted) return;
      
      // Limpar dados ao fazer logout
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setData(null);
        setHasAccess(false);
        setIsCheckingAuth(false);
        return;
      }
      
      setUser(session?.user || null);
      
      if (session?.user && event === 'SIGNED_IN') {
        await loadUserData(session.user.id);
      } else if (!session?.user) {
        setData(null);
        setHasAccess(false);
        setIsCheckingAuth(false);
      }
    });

    // Listener para quando a aba recupera o foco (usuário volta de "Ver meu site")
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isMounted && user) {
        console.log('👀 Aba voltou a ter foco, verificando sessão...');
        
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error || !session) {
            console.warn('⚠️ Sessão perdida após voltar à aba');
            setUser(null);
            setData(null);
            setHasAccess(false);
            setIsCheckingAuth(false);
            return;
          }
          
          // Só recarregar se havia dados antes (usuário já estava autenticado)
          if (session?.user && hasAccess && data) {
            console.log('🔄 Verificando integridade dos dados do painel...');
            // Apenas revalida, não força recarga completa
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            if (!currentSession) {
              console.log('⚠️ Sessão inválida detectada, solicitando novo login');
              setUser(null);
              setData(null);
              setHasAccess(false);
              setIsCheckingAuth(false);
            }
          }
        } catch (error) {
          console.error('❌ Erro ao verificar sessão após voltar à aba:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [slug]);

  const loadUserData = async (userId: string) => {
    try {
      console.log('📥 Carregando dados do usuário...', { userId, slugFromUrl: slug });
      
      // Primeiro, buscar a confeitaria do usuário
      const { data: userBakeryData, error: userBakeryError } = await supabase
        .from('bakeries')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (userBakeryError) {
        console.error('❌ Erro ao buscar bakery do usuário:', userBakeryError);
        setIsCheckingAuth(false);
        setHasAccess(false);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar dados da confeitaria',
          variant: 'destructive',
        });
        return;
      }

      if (!userBakeryData) {
        console.warn('⚠️ Confeitaria não encontrada para o usuário');
        setIsCheckingAuth(false);
        setHasAccess(false);
        toast({
          title: 'Confeitaria não encontrada',
          description: 'Por favor, complete o cadastro',
          variant: 'destructive',
        });
        navigate('/');
        return;
      }

      // Se há slug na URL, verificar se corresponde à confeitaria do usuário
      if (slug) {
        if (slug !== userBakeryData.slug) {
          console.warn('⚠️ Acesso negado: slug não corresponde à confeitaria do usuário');
          setIsCheckingAuth(false);
          setHasAccess(false);
          toast({
            title: 'Acesso negado',
            description: 'Você não tem permissão para acessar este painel',
            variant: 'destructive',
          });
          // Fazer logout e redirecionar
          await supabase.auth.signOut();
          setUser(null);
          setData(null);
          navigate('/admin', { replace: true });
          return;
        }
      } else {
        // Se não há slug na URL, redirecionar para o slug correto
        console.log('🔄 Redirecionando para:', `/${userBakeryData.slug}/admin`);
        navigate(`/${userBakeryData.slug}/admin`, { replace: true });
        return;
      }

      const bakery = userBakeryData;

      console.log('✅ Bakery encontrada:', bakery);
      setUserSlug(bakery.slug);
      setBakeryId(bakery.id);
      setHasAccess(true);

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
      
      setIsCheckingAuth(false);
    } catch (error) {
      console.error('❌ Erro ao carregar dados do usuário:', error);
      setIsCheckingAuth(false);
      setHasAccess(false);
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
    try {
      // Limpar completamente a sessão do Supabase
      await supabase.auth.signOut();
      
      // Limpar estados locais
      setUser(null);
      setData(null);
      setHasAccess(false);
      setUserSlug('');
      setBakeryId('');
      
      toast({
        title: 'Sessão encerrada',
        description: 'Você saiu do painel administrativo.',
      });
      
      // Redirecionar para login
      navigate('/admin', { replace: true });
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao sair. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleDataChange = async (newData: AppData) => {
    setData(newData);
  };

  const handleCloseAdmin = () => {
    if (userSlug) {
      navigate(`/${userSlug}`);
    } else {
      navigate('/');
    }
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

  if (!data || !hasAccess) {
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
