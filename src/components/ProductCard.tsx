import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Product, Tag, CartItem } from '@/types';

interface ProductCardProps {
  product: Product;
  tags: Tag[];
  onAddToCart: (item: CartItem) => void;
}

export function ProductCard({ product, tags, onAddToCart }: ProductCardProps) {
  const [selectedSizeId, setSelectedSizeId] = useState(product.sizes[0]?.id || '');
  
  const selectedSize = product.sizes.find(s => s.id === selectedSizeId) || product.sizes[0];
  const productTags = tags.filter(tag => product.tags.includes(tag.id));

  const shouldShowImage = product.showImage !== false && product.image;

  return (
    <div className="bg-card rounded-xl overflow-hidden shadow-soft transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      {/* Image */}
      {shouldShowImage && (
        <div className="relative bg-background overflow-hidden" style={{ aspectRatio: '1 / 1.2' }}>
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105"
          />
          
          {/* Tags */}
          {productTags.length > 0 && (
            <div className="absolute top-3 right-3 flex flex-col gap-2">
              {productTags.map(tag => (
                <span 
                  key={tag.id}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold text-white shadow-lg backdrop-blur-sm bg-opacity-95 border border-white/20 transition-transform duration-200 hover:scale-105"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.emoji && <span className="mr-1">{tag.emoji}</span>}
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

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
          onClick={() => onAddToCart({
            productId: product.id,
            productName: product.name,
            sizeId: selectedSizeId,
            sizeName: selectedSize.name,
            price: selectedSize.price,
            quantity: 1,
            type: 'product'
          })}
          className="w-full transition-all duration-200"
          size="lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar ao pedido
        </Button>
      </div>
    </div>
  );
}
