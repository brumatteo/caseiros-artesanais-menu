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

  const loadUserData = async (userId: string, retryCount = 0) => {
    try {
      // Fetch user profile with retry for new users (waiting for trigger)
      const { data: profile } = await supabase
        .from('profiles')
        .select('slug, confectionery_name')
        .eq('id', userId)
        .maybeSingle();

      // If profile not found and this is a retry, wait and try again
      if (!profile && retryCount < 3) {
        setTimeout(() => {
          loadUserData(userId, retryCount + 1);
        }, 1000);
        return;
      }

      if (!profile) {
        toast({
          title: 'Erro',
          description: 'Perfil não encontrado. Por favor, entre em contato com o suporte.',
          variant: 'destructive',
        });
        return;
      }

      setUserSlug(profile.slug);

      // Fetch all user data in parallel
      const [settingsRes, productsRes, sizesRes, sectionsRes, extrasRes, tagsRes] = 
        await Promise.all([
          supabase.from('user_settings').select('*').eq('user_id', userId).maybeSingle(),
          supabase.from('products').select('*').eq('user_id', userId),
          supabase.from('product_sizes').select('*'),
          supabase.from('sections').select('*').eq('user_id', userId),
          supabase.from('extras').select('*').eq('user_id', userId),
          supabase.from('tags').select('*').eq('user_id', userId),
        ]);

      if (!settingsRes.data) {
        // First time login - create default settings
        const created = await createDefaultSettings(userId, profile.confectionery_name);
        if (created) {
          await loadUserData(userId, 0); // Reload data
        }
        return;
      }

      // Transform to AppData format (same as PublicView)
      const settings = settingsRes.data;
      const appData: AppData = {
        settings: {
          brandName: settings.brand_name,
          showLogo: settings.show_logo,
          showName: settings.show_name,
          logoImage: settings.logo_image,
          heroLogoImage: settings.hero_logo_image,
          showHeroLogo: settings.show_hero_logo,
          heroImage: settings.hero_image,
          heroImagePosition: settings.hero_image_position,
          heroOverlayColor: settings.hero_overlay_color,
          heroOverlayOpacity: settings.hero_overlay_opacity,
          heroTitle: settings.hero_title,
          heroSubtitle: settings.hero_subtitle,
          whatsappNumber: settings.whatsapp_number,
          whatsappMessage: settings.whatsapp_message,
          aboutTitle: settings.about_title,
          aboutText: settings.about_text,
          aboutImage: settings.about_image,
          showAbout: settings.show_about,
          extraInfoTitle: settings.extra_info_title,
          extraInfoText: settings.extra_info_text,
          showExtraInfo: settings.show_extra_info,
          footerText: settings.footer_text,
          footerAddress: settings.footer_address,
          footerPhone: settings.footer_phone,
          instagramUrl: settings.instagram_url,
          adminPassword: '',
          colorPrimary: settings.color_primary,
          colorSecondary: settings.color_secondary,
          colorAccent: settings.color_accent,
          colorBackground: settings.color_background,
          colorForeground: settings.color_foreground,
        },
        products: (productsRes.data || []).map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          image: p.image,
          showImage: p.show_image,
          tags: p.tags || [],
          order: p.order_index,
          sizes: (sizesRes.data || [])
            .filter((s) => s.product_id === p.id)
            .map((s) => ({
              id: s.id,
              name: s.name,
              price: Number(s.price),
            })),
        })),
        sections: (sectionsRes.data || []).map((s) => ({
          id: s.id,
          name: s.name,
          visible: s.visible,
          order: s.order_index,
          productIds: s.product_ids || [],
        })),
        extras: (extrasRes.data || []).map((e) => ({
          id: e.id,
          name: e.name,
          description: e.description,
          price: Number(e.price),
          image: e.image,
          showImage: e.show_image,
          order: e.order_index,
        })),
        tags: (tagsRes.data || []).map((t) => ({
          id: t.id,
          name: t.name,
          color: t.color,
          emoji: t.emoji,
        })),
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

  const createDefaultSettings = async (userId: string, confectioneryName: string): Promise<boolean> => {
    try {
      const defaultSettings = {
        user_id: userId,
        brand_name: confectioneryName || 'Minha Confeitaria',
        show_logo: false,
        show_name: true,
        show_hero_logo: false,
        hero_image_position: 'center',
        hero_overlay_color: '#000000',
        hero_overlay_opacity: 0.5,
        hero_title: 'Bem-vindo à nossa confeitaria',
        hero_subtitle: 'Doces artesanais feitos com carinho',
        whatsapp_number: '',
        whatsapp_message: 'Olá! Gostaria de fazer um pedido:',
        about_title: 'Sobre Nós',
        about_text: 'Somos uma confeitaria artesanal dedicada a criar doces deliciosos.',
        show_about: true,
        extra_info_title: 'Informações Importantes',
        extra_info_text: 'Faça seu pedido com antecedência!',
        show_extra_info: true,
        footer_text: `© ${new Date().getFullYear()} ${confectioneryName || 'Minha Confeitaria'}. Todos os direitos reservados.`,
      };

      const { error } = await supabase.from('user_settings').insert(defaultSettings);
      
      if (error) {
        console.error('Error creating settings:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível criar as configurações: ' + error.message,
          variant: 'destructive',
        });
        return false;
      }
      
      return true;
    } catch (error: any) {
      console.error('Error in createDefaultSettings:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar configurações',
        variant: 'destructive',
      });
      return false;
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
