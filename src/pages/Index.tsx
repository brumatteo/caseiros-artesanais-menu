import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { ProductCard } from '@/components/ProductCard';
import { ExtraCard } from '@/components/ExtraCard';
import { Footer } from '@/components/Footer';
import { CartModal } from '@/components/CartModal';
import { AdminPanel } from '@/components/AdminPanel';
import { LoginModal } from '@/components/LoginModal';
import { FloatingWhatsAppButton } from '@/components/FloatingWhatsAppButton';
import { getStoredData, saveData } from '@/lib/storage';
import { AppData, CartItem } from '@/types';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [data, setData] = useState<AppData>(getStoredData());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const saved = saveData(data);
    if (!saved) {
      toast({
        title: "Aviso: Espaço de armazenamento",
        description: "Os dados estão muito grandes para salvar. Reduza o tamanho das imagens ou exporte um backup.",
        variant: "destructive",
      });
    }
  }, [data]);

  const handleLogin = (username: string, password: string): boolean => {
    if (username === 'admin' && password === data.settings.adminPassword) {
      setIsAuthenticated(true);
      setIsAdminOpen(true);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsAdminOpen(false);
    toast({
      title: "Sessão encerrada",
      description: "Você saiu do painel administrativo.",
    });
  };

  const handleSettingsClick = () => {
    if (isAuthenticated) {
      setIsAdminOpen(true);
    } else {
      setIsLoginOpen(true);
    }
  };

  const addToCart = (productId: string, sizeId: string) => {
    const product = data.products.find(p => p.id === productId);
    const size = product?.sizes.find(s => s.id === sizeId);
    
    if (!product || !size) return;

    const existingIndex = cart.findIndex(
      item => item.productId === productId && item.sizeId === sizeId
    );

    if (existingIndex >= 0) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          productId,
          productName: product.name,
          sizeId,
          sizeName: size.name,
          price: size.price,
          quantity: 1,
          type: 'product',
        },
      ]);
    }

    toast({
      title: "Adicionado ao pedido!",
      description: `${product.name} - ${size.name}`,
    });
  };

  const addExtraToCart = (extraId: string) => {
    const extra = data.extras.find(e => e.id === extraId);
    if (!extra) return;

    const existingIndex = cart.findIndex(item => item.productId === extraId && item.type === 'extra');

    if (existingIndex >= 0) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          productId: extraId,
          productName: extra.name,
          sizeId: 'default',
          sizeName: 'Unidade',
          price: extra.price,
          quantity: 1,
          type: 'extra',
        },
      ]);
    }

    toast({
      title: "Adicionado ao pedido!",
      description: extra.name,
    });
  };

  const updateCartQuantity = (index: number, delta: number) => {
    const updated = [...cart];
    updated[index].quantity += delta;
    if (updated[index].quantity <= 0) {
      updated.splice(index, 1);
    }
    setCart(updated);
  };

  const removeCartItem = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const handleCheckout = (customerName: string, customerPhone: string, message: string) => {
    const items = cart.map(
      item => `• ${item.productName} - ${item.sizeName} x${item.quantity} = R$ ${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    let whatsappMessage = `${data.settings.whatsappMessage}\n\n*Nome:* ${customerName}\n*Telefone:* ${customerPhone}\n\n*Itens:*\n${items}\n\n*Total Aproximado:* R$ ${total.toFixed(2)}`;

    if (message.trim()) {
      whatsappMessage += `\n\n*Observações:*\n${message}`;
    }

    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappNumber = data.settings.whatsappNumber;
    
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const whatsappUrl = isMobile
      ? `https://wa.me/${whatsappNumber}?text=${encodedMessage}`
      : `https://web.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`;

    const opened = window.open(whatsappUrl, '_blank');
    
    if (!opened) {
      alert(
        `Caso o WhatsApp não abra automaticamente, entre em contato diretamente pelo número:\n\n${whatsappNumber}`
      );
    }

    setCart([]);
    setIsCartOpen(false);
    
    toast({
      title: "Pedido enviado!",
      description: "Aguarde nosso contato no WhatsApp.",
    });
  };

  const sortedProducts = [...data.products].sort((a, b) => a.order - b.order);
  const sortedExtras = [...data.extras].sort((a, b) => a.order - b.order);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        settings={data.settings}
        cartItemCount={cartItemCount}
        onSettingsClick={handleSettingsClick}
        onCartClick={() => setIsCartOpen(true)}
      />

      <main className="flex-1">
        <Hero settings={data.settings} />

        {/* Products Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-display font-semibold text-center mb-12">
              Nossos Bolos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  tags={data.tags}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Extras Section */}
        {sortedExtras.length > 0 && (
          <section className="py-16 bg-accent/20">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl md:text-4xl font-display font-semibold text-center mb-12">
                Coberturas e Extras
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {sortedExtras.map(extra => (
                  <ExtraCard
                    key={extra.id}
                    extra={extra}
                    onAddToCart={addExtraToCart}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Extra Info Section */}
        {data.settings.showExtraInfo && data.settings.extraInfoText && (
          <section className="py-12 bg-card">
            <div className="container mx-auto px-4 max-w-3xl">
              <h2 className="text-2xl md:text-3xl font-display font-semibold text-center mb-6">
                {data.settings.extraInfoTitle || 'Informações Adicionais'}
              </h2>
              <div className="bg-secondary/10 border border-secondary rounded-xl p-6">
                <pre className="whitespace-pre-wrap font-sans text-foreground">
                  {data.settings.extraInfoText}
                </pre>
              </div>
            </div>
          </section>
        )}

        {/* About Section */}
        {data.settings.showAbout && (
          <section className="py-16 bg-background">
            <div className="container mx-auto px-4 max-w-4xl">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {data.settings.aboutImage && (
                  <img
                    src={data.settings.aboutImage}
                    alt="Sobre nós"
                    className="w-full h-80 object-cover rounded-xl shadow-soft"
                  />
                )}
                <div className={data.settings.aboutImage ? '' : 'md:col-span-2 text-center'}>
                  <h2 className="text-3xl md:text-4xl font-display font-semibold mb-4">
                    {data.settings.aboutTitle}
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {data.settings.aboutText}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer settings={data.settings} />

      <FloatingWhatsAppButton 
        onClick={() => setIsCartOpen(true)}
        itemCount={cartItemCount}
      />

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeCartItem}
        onCheckout={handleCheckout}
      />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLogin={handleLogin}
      />

      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        data={data}
        onDataChange={setData}
        onLogout={handleLogout}
      />
    </div>
  );
};

export default Index;
