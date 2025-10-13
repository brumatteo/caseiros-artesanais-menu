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
import { AppData, Product, Extra, CartItem } from '@/types';
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
        // Get profile by slug
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('slug', slug)
          .single();

        if (profileError || !profile) {
          navigate('/');
          return;
        }

        // Fetch all data in parallel
        const [settingsRes, productsRes, sizesRes, sectionsRes, extrasRes, tagsRes] = 
          await Promise.all([
            supabase.from('user_settings').select('*').eq('user_id', profile.id).single(),
            supabase.from('products').select('*').eq('user_id', profile.id),
            supabase.from('product_sizes').select('*'),
            supabase.from('sections').select('*').eq('user_id', profile.id),
            supabase.from('extras').select('*').eq('user_id', profile.id),
            supabase.from('tags').select('*').eq('user_id', profile.id),
          ]);

        if (settingsRes.error || !settingsRes.data) {
          navigate('/');
          return;
        }

        // Transform database data to AppData format
        const products: Product[] = (productsRes.data || []).map((p) => ({
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
        }));

        const extras: Extra[] = (extrasRes.data || []).map((e) => ({
          id: e.id,
          name: e.name,
          description: e.description,
          price: Number(e.price),
          image: e.image,
          showImage: e.show_image,
          order: e.order_index,
        }));

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
          products,
          sections: (sectionsRes.data || []).map((s) => ({
            id: s.id,
            name: s.name,
            visible: s.visible,
            order: s.order_index,
            productIds: s.product_ids || [],
          })),
          extras,
          tags: (tagsRes.data || []).map((t) => ({
            id: t.id,
            name: t.name,
            color: t.color,
            emoji: t.emoji,
          })),
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

  const visibleSections = data.sections
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-background">
      <Navbar settings={data.settings} cartItemCount={cart.length} onCartClick={() => setIsCartOpen(true)} />
      <Hero settings={data.settings} />

      <main className="container mx-auto px-4 py-12">
        {visibleSections.map((section) => {
          const sectionProducts = section.productIds
            .map((id) => data.products.find((p) => p.id === id))
            .filter((p): p is Product => p !== undefined)
            .sort((a, b) => a.order - b.order);

          if (sectionProducts.length === 0) return null;

          return (
            <section key={section.id} className="mb-16">
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
            </section>
          );
        })}

        {data.extras.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-display font-bold text-center mb-8">
              Adicionais
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.extras
                .sort((a, b) => a.order - b.order)
                .map((extra) => (
                  <ExtraCard
                    key={extra.id}
                    extra={extra}
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
