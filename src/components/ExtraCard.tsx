import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Extra, CartItem } from '@/types';

interface ExtraCardProps {
  extra: Extra;
  onAddToCart: (item: CartItem) => void;
}

export function ExtraCard({ extra, onAddToCart }: ExtraCardProps) {
  const shouldShowImage = extra.showImage !== false && extra.image;

  return (
    <div className="bg-card rounded-xl overflow-hidden shadow-soft hover-lift">
      {/* Image */}
      {shouldShowImage && (
        <div className="relative bg-background overflow-hidden" style={{ aspectRatio: '1 / 1.2' }}>
          <img 
            src={extra.image} 
            alt={extra.name} 
            className="w-full h-full object-cover object-center"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-display font-semibold text-foreground mb-1">
          {extra.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-3">
          {extra.description}
        </p>

        <div className="flex items-center justify-between gap-3">
          <p className="text-xl font-semibold text-primary">
            R$ {extra.price.toFixed(2)}
          </p>
          
          <Button 
            onClick={() => onAddToCart({
              productId: extra.id,
              productName: extra.name,
              sizeId: extra.id,
              sizeName: 'Unidade',
              price: extra.price,
              quantity: 1,
              type: 'extra'
            })}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        </div>
      </div>
    </div>
  );
}
