import { useState } from 'react';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CartItem } from '@/types';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (index: number, delta: number) => void;
  onRemoveItem: (index: number) => void;
  onCheckout: (customerName: string, customerPhone: string, message: string) => void;
}

export function CartModal({ 
  isOpen, 
  onClose, 
  cart, 
  onUpdateQuantity, 
  onRemoveItem,
  onCheckout 
}: CartModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [message, setMessage] = useState('');

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Por favor, preencha seu nome e telefone.');
      return;
    }
    onCheckout(customerName, customerPhone, message);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display flex items-center gap-2">
            <ShoppingBag className="h-6 w-6" />
            Seu Pedido
          </DialogTitle>
        </DialogHeader>

        {cart.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground mb-4">Seu carrinho está vazio</p>
            <Button onClick={onClose}>Voltar ao cardápio</Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Items */}
            <div className="space-y-3">
              {cart.map((item, index) => (
                <div key={index} className="flex items-center gap-3 bg-accent/50 rounded-lg p-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{item.productName}</h4>
                    <p className="text-sm text-muted-foreground">{item.sizeName}</p>
                    <p className="text-sm font-medium text-primary mt-1">
                      R$ {item.price.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onUpdateQuantity(index, -1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onUpdateQuantity(index, 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveItem(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total Aproximado:</span>
                <span className="text-primary text-2xl">R$ {total.toFixed(2)}</span>
              </div>
            </div>

            {/* Customer Info */}
            <div className="space-y-3 border-t pt-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Seu Nome *</label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Como você se chama?"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">WhatsApp *</label>
                <Input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  type="tel"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Mensagem (opcional)</label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Alguma observação sobre seu pedido?"
                  rows={3}
                />
              </div>
            </div>

            {/* Info Message */}
            <div className="bg-secondary/20 border border-secondary rounded-lg p-4">
              <p className="text-sm text-foreground">
                <strong>Atenção:</strong> Este é apenas um resumo do seu pedido. 
                O pagamento e a confirmação serão feitos diretamente conosco pelo WhatsApp.
              </p>
            </div>

            {/* Checkout Button */}
            <Button 
              onClick={handleCheckout}
              className="w-full"
              size="lg"
            >
              Enviar pedido pelo WhatsApp
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
