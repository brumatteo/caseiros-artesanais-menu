import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Product, Tag } from '@/types';

interface ProductCardProps {
  product: Product;
  tags: Tag[];
  onAddToCart: (productId: string, sizeId: string) => void;
}

export function ProductCard({ product, tags, onAddToCart }: ProductCardProps) {
  const [selectedSizeId, setSelectedSizeId] = useState(product.sizes[0]?.id || '');
  
  const selectedSize = product.sizes.find(s => s.id === selectedSizeId) || product.sizes[0];
  const productTags = tags.filter(tag => product.tags.includes(tag.id));

  return (
    <div className="bg-card rounded-xl overflow-hidden shadow-soft hover-lift">
      {/* Image */}
      <div className="relative h-56 bg-accent overflow-hidden">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            🍰
          </div>
        )}
        
        {/* Tags */}
        {productTags.length > 0 && (
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            {productTags.map(tag => (
              <span 
                key={tag.id}
                className="px-3 py-1 rounded-full text-xs font-medium text-white shadow-md"
                style={{ backgroundColor: tag.color }}
              >
                {tag.emoji && <span className="mr-1">{tag.emoji}</span>}
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-xl font-display font-semibold text-foreground mb-2">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {product.description}
        </p>

        {/* Size Selector & Price */}
        <div className="flex items-end gap-3 mb-4">
          {product.sizes.length > 1 ? (
            <div className="flex-1">
              <Select value={selectedSizeId} onValueChange={setSelectedSizeId}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {product.sizes.map(size => (
                    <SelectItem key={size.id} value={size.id}>
                      {size.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">{selectedSize.name}</p>
            </div>
          )}
          
          <div className="text-right">
            <p className="text-2xl font-semibold text-primary">
              R$ {selectedSize.price.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Add Button */}
        <Button 
          onClick={() => onAddToCart(product.id, selectedSizeId)}
          className="w-full"
          size="lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar ao pedido
        </Button>
      </div>
    </div>
  );
}
