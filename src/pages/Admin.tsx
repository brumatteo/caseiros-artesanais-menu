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

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [data, setData] = useState<AppData | null>(null);
  const [userSlug, setUserSlug] = useState<string>('');

  useEffect(() => {
    if (data?.settings) {
      useThemeColors(data.settings);
    }
  }, [data]);

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
      // Fetch bakery info
      const { data: bakery, error: bakeryError } = await supabase
        .from('bakeries')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (bakeryError) {
        console.error('Error fetching bakery:', bakeryError);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar dados da confeitaria',
          variant: 'destructive',
        });
        return;
      }

      if (!bakery) {
        toast({
          title: 'Confeitaria não encontrada',
          description: 'Por favor, complete o cadastro',
          variant: 'destructive',
        });
        return;
      }

      setUserSlug(bakery.slug);

      // Fetch products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('bakery_id', bakery.id)
        .order('created_at', { ascending: true });

      if (productsError) {
        console.error('Error fetching products:', productsError);
      }

      // Create simplified AppData structure
      const appData: AppData = {
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
        products: (products || []).map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description || '',
          image: p.image_url,
          showImage: !!p.image_url,
          tags: [],
          order: 0,
          sizes: [{
            id: 'default',
            name: 'Padrão',
            price: Number(p.price),
          }],
        })),
        sections: [],
        extras: [],
        tags: [],
      };

      setData(appData);
    } catch (error) {
      console.error('Error loading user data:', error);
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

  const handleDataChange = (newData: AppData) => {
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
    />
  );
};

export default Admin;
