import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Extra } from '@/types';

interface ExtraCardProps {
  extra: Extra;
  onAddToCart: (extraId: string) => void;
}

export function ExtraCard({ extra, onAddToCart }: ExtraCardProps) {
  return (
    <div className="bg-card rounded-xl overflow-hidden shadow-soft hover-lift">
      {/* Image */}
      <div className="relative h-40 bg-accent overflow-hidden">
        {extra.image ? (
          <img 
            src={extra.image} 
            alt={extra.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            🍫
          </div>
        )}
      </div>

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
            onClick={() => onAddToCart(extra.id)}
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
