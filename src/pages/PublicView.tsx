import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { ProductCard } from '@/components/ProductCard';
import { ExtraCard } from '@/components/ExtraCard';
import { FloatingWhatsAppButton } from '@/components/FloatingWhatsAppButton';
import { Footer } from '@/components/Footer';
import { CartModal } from '@/components/CartModal';
import { AppData, Product, CartItem } from '@/types';
import { Loader2 } from 'lucide-react';

export default function PublicView() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<AppData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    if (!slug) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        // Get bakery by slug
        const { data: bakery, error: bakeryError } = await supabase
          .from('bakeries')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (bakeryError || !bakery) {
          navigate('/');
          return;
        }

        // Fetch products for this bakery
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('bakery_id', bakery.id)
          .order('created_at', { ascending: true });

        if (productsError) {
          console.error('Error fetching products:', productsError);
        }

        // Transform database data to AppData format
        const productsData: Product[] = (products || []).map((p) => ({
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
        }));

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
          products: productsData,
          sections: [],
          extras: [],
          tags: [],
        };

        setData(appData);
      } catch (error) {
        console.error('Error fetching data:', error);
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [slug, navigate]);

  const handleAddToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find(
        (i) => i.productId === item.productId && i.sizeId === item.sizeId
      );
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId && i.sizeId === item.sizeId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar settings={data.settings} cartItemCount={cart.length} onCartClick={() => setIsCartOpen(true)} />
      <Hero settings={data.settings} />

      <main className="container mx-auto px-4 py-12">
        {data.products.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-display font-bold text-center mb-8">
              Nossos Produtos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  tags={data.tags}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </section>
        )}

        {data.settings.showAbout && (
          <section className="mb-16 bg-card rounded-lg p-8">
            <h2 className="text-3xl font-display font-bold text-center mb-6">
              {data.settings.aboutTitle}
            </h2>
            <div className="prose prose-lg mx-auto text-center">
              <p>{data.settings.aboutText}</p>
            </div>
          </section>
        )}

        {data.settings.showExtraInfo && (
          <section className="mb-16 bg-muted rounded-lg p-8">
            <h2 className="text-2xl font-display font-bold text-center mb-4">
              {data.settings.extraInfoTitle}
            </h2>
            <p className="text-center text-muted-foreground">
              {data.settings.extraInfoText}
            </p>
          </section>
        )}
      </main>

      <Footer settings={data.settings} />
      <FloatingWhatsAppButton settings={data.settings} />
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateCart={setCart}
        whatsappNumber={data.settings.whatsappNumber}
      />
    </div>
  );
}
