import { useState } from 'react';
import { Plus, Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppData, Product } from '@/types';
import { ProductEditor } from './ProductEditor';

interface ProductsTabProps {
  data: AppData;
  onDataChange: (data: AppData) => void;
}

export function ProductsTab({ data, onDataChange }: ProductsTabProps) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const sortedProducts = [...data.products].sort((a, b) => a.order - b.order);

  const handleSaveProduct = (product: Product) => {
    const updatedProducts = editingProduct
      ? data.products.map(p => p.id === product.id ? product : p)
      : [...data.products, product];
    
    onDataChange({ ...data, products: updatedProducts });
    setEditingProduct(null);
    setIsCreating(false);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Tem certeza que deseja remover este produto?')) {
      onDataChange({
        ...data,
        products: data.products.filter(p => p.id !== id)
      });
    }
  };

  const handleMoveProduct = (id: string, direction: 'up' | 'down') => {
    const currentIndex = sortedProducts.findIndex(p => p.id === id);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= sortedProducts.length) return;

    const reordered = [...sortedProducts];
    [reordered[currentIndex], reordered[newIndex]] = [reordered[newIndex], reordered[currentIndex]];
    
    const updatedProducts = reordered.map((p, index) => ({ ...p, order: index + 1 }));
    onDataChange({ ...data, products: updatedProducts });
  };

  if (editingProduct || isCreating) {
    return (
      <ProductEditor
        product={editingProduct}
        tags={data.tags}
        onSave={handleSaveProduct}
        onCancel={() => {
          setEditingProduct(null);
          setIsCreating(false);
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Produtos do Cardápio</h3>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Produto
        </Button>
      </div>

      <div className="space-y-3">
        {sortedProducts.map((product, index) => (
          <div key={product.id} className="bg-accent/50 rounded-lg p-4 flex items-center gap-4">
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleMoveProduct(product.id, 'up')}
                disabled={index === 0}
                className="h-6 w-6"
              >
                <ArrowUp className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleMoveProduct(product.id, 'down')}
                disabled={index === sortedProducts.length - 1}
                className="h-6 w-6"
              >
                <ArrowDown className="h-3 w-3" />
              </Button>
            </div>

            {product.image && (
              <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded" />
            )}

            <div className="flex-1">
              <h4 className="font-semibold">{product.name}</h4>
              <p className="text-sm text-muted-foreground">{product.description}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {product.sizes.length} tamanho(s) • {product.tags.length} tag(s)
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setEditingProduct(product)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleDeleteProduct(product.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
