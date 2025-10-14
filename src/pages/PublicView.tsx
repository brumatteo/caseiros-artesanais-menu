import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { ProductCard } from '@/components/ProductCard';

import { Footer } from '@/components/Footer';
import { CartModal } from '@/components/CartModal';
import { AppData, Product, CartItem } from '@/types';
import { Loader2 } from 'lucide-react';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function PublicView() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<AppData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Apply theme colors
  useThemeColors(data?.settings || {} as any);

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

        // Fetch sections for this bakery
        const { data: sections, error: sectionsError } = await supabase
          .from('sections')
          .select('*')
          .eq('bakery_id', bakery.id)
          .order('section_order', { ascending: true });

        if (sectionsError) {
          console.error('Error fetching sections:', sectionsError);
        }

        // Fetch tags for this bakery
        const { data: tags, error: tagsError } = await supabase
          .from('tags')
          .select('*')
          .eq('bakery_id', bakery.id);

        if (tagsError) {
          console.error('Error fetching tags:', tagsError);
        }

        // Transform database data to AppData format - SEM DEFAULTS
        const productsData: Product[] = (products || []).map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description || '',
          image: p.image_url,
          showImage: !!p.image_url,
          tags: (p.tags as string[]) || [],
          order: p.product_order || 0,
          sizes: (p.sizes as any) || [{
            id: 'default',
            name: 'Padrão',
            price: Number(p.price),
          }],
        }));

        const appData: AppData = {
          settings: bakery.settings || {
            brandName: bakery.confectionery_name || '',
            showLogo: false,
            showName: false,
            showHeroLogo: false,
            heroImagePosition: 'center',
            heroOverlayColor: '#000000',
            heroOverlayOpacity: 0.5,
            heroTitle: '',
            heroSubtitle: '',
            whatsappNumber: '',
            whatsappMessage: '',
            aboutTitle: '',
            aboutText: '',
            showAbout: false,
            extraInfoTitle: '',
            extraInfoText: '',
            showExtraInfo: false,
            footerText: '',
            adminPassword: '',
          },
          products: productsData,
          sections: (sections || []).map((s) => ({
            id: s.id,
            name: s.name,
            visible: s.visible !== false,
            order: s.section_order || 0,
            productIds: (s.product_ids as string[]) || [],
          })),
          extras: [],
          tags: (tags || []).map((t) => ({
            id: t.id,
            name: t.name,
            color: t.color,
            emoji: t.emoji || '',
          })),
        };

        console.log('📊 Dados carregados para PublicView:', {
          bakeryName: bakery.confectionery_name,
          slug: bakery.slug,
          productsCount: productsData.length,
          sectionsCount: (sections || []).length,
          visibleSections: (sections || []).filter(s => s.visible !== false).length,
          settings: appData.settings,
          sections: appData.sections,
          products: appData.products
        });

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
      {/* Navbar - só renderiza se tiver brandName ou logo */}
      {(data.settings.brandName || data.settings.logoImage) && (
        <Navbar settings={data.settings} cartItemCount={cart.length} onCartClick={() => setIsCartOpen(true)} />
      )}
      
      {/* Hero - renderização condicional está dentro do componente */}
      <Hero settings={data.settings} />

      <main className="container mx-auto px-4 py-12">
        {/* Renderizar seções dinamicamente do banco de dados */}
        {data.sections
          .filter(section => section.visible)
          .sort((a, b) => a.order - b.order)
          .map((section, index) => {
            const sectionProducts = data.products.filter(p => 
              section.productIds.includes(p.id)
            );
            
            console.log(`🔍 Renderizando seção "${section.name}":`, {
              sectionId: section.id,
              productIds: section.productIds,
              foundProducts: sectionProducts.length,
              productNames: sectionProducts.map(p => p.name),
              allProductIds: data.products.map(p => p.id)
            });
            
            // Só renderizar seção se tiver produtos
            if (sectionProducts.length === 0) {
              console.warn(`⚠️ Seção "${section.name}" não tem produtos vinculados`);
              return null;
            }
            
            // Alternar fundo sutil entre seções
            const bgClass = index % 2 === 0 ? 'bg-background' : 'bg-muted/30';
            
            return (
              <section key={section.id} id={`section-${section.id}`} className={`py-12 -mx-4 px-4 mb-8 transition-colors duration-300 ${bgClass}`}>
                <div className="container mx-auto">
                  <h2 className="text-3xl font-display font-bold text-center mb-8">
                    {section.name}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sectionProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        tags={data.tags}
                        onAddToCart={handleAddToCart}
                      />
                    ))}
                  </div>
                </div>
              </section>
            );
          })
        }

        {data.settings.showAbout && (
          <section className="mb-28 bg-card/50 backdrop-blur-sm rounded-2xl p-12 max-w-7xl mx-auto transition-all duration-300">
            <h2 className="text-3xl font-display font-bold text-center mb-12">
              {data.settings.aboutTitle}
            </h2>
            <div className="flex flex-col md:flex-row gap-12 items-center">
              {data.settings.showAboutImage !== false && data.settings.aboutImage && (
                <div className="flex-shrink-0 w-full md:w-[45%]">
                  <img 
                    src={data.settings.aboutImage} 
                    alt={data.settings.aboutTitle || 'Sobre'} 
                    className="w-full rounded-xl shadow-xl object-cover transition-transform duration-300 hover:scale-[1.02]"
                    style={{ aspectRatio: '16/10' }}
                  />
                </div>
              )}
              <div className="flex-1 flex flex-col justify-center px-4">
                <p className="text-lg whitespace-pre-wrap leading-[1.9] text-foreground/90">{data.settings.aboutText}</p>
              </div>
            </div>
          </section>
        )}

        {data.settings.showExtraInfo && (
          <section className="mb-20 bg-muted/40 backdrop-blur-sm rounded-xl p-10 transition-all duration-300">
            <h2 className="text-2xl font-display font-bold text-center mb-6">
              {data.settings.extraInfoTitle}
            </h2>
            <p className="text-center text-muted-foreground whitespace-pre-line leading-relaxed max-w-3xl mx-auto">
              {data.settings.extraInfoText}
            </p>
          </section>
        )}
      </main>

      <Footer settings={data.settings} />
      
      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 py-3 shadow-lg flex items-center gap-2 font-medium transition-all animate-fade-in"
        >
          🛒 Finalizar Pedido ({cart.length})
        </button>
      )}
      
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateCart={setCart}
        whatsappNumber={data.settings.whatsappNumber}
        whatsappMessage={data.settings.whatsappMessage}
      />
    </div>
  );
}
