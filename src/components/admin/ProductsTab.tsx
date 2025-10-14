import { useState } from 'react';
import { Plus, Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AppData, Product } from '@/types';
import { ProductEditor } from './ProductEditor';

interface ProductsTabProps {
  data: AppData;
  onDataChange: (data: AppData) => void;
  sectionId?: string;
}

export function ProductsTab({ data, onDataChange, sectionId }: ProductsTabProps) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string>(
    sectionId || data.sections[0]?.id || ''
  );

  const currentSection = data.sections.find(s => s.id === selectedSection);
  const sectionProducts = currentSection 
    ? data.products.filter(p => currentSection.productIds.includes(p.id))
    : [];
  const sortedProducts = [...sectionProducts].sort((a, b) => a.order - b.order);

  const handleSaveProduct = (product: Product) => {
    let updatedProducts: Product[];
    let updatedSections = [...data.sections];

    if (editingProduct) {
      updatedProducts = data.products.map(p => p.id === product.id ? product : p);
    } else {
      updatedProducts = [...data.products, product];
      // Add new product to current section
      updatedSections = data.sections.map(s => 
        s.id === selectedSection 
          ? { ...s, productIds: [...s.productIds, product.id] }
          : s
      );
    }
    
    onDataChange({ ...data, products: updatedProducts, sections: updatedSections });
    setEditingProduct(null);
    setIsCreating(false);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Tem certeza que deseja remover este produto?')) {
      const updatedSections = data.sections.map(s => ({
        ...s,
        productIds: s.productIds.filter(pid => pid !== id)
      }));
      
      onDataChange({
        ...data,
        products: data.products.filter(p => p.id !== id),
        sections: updatedSections
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
    
    // Update orders for reordered products
    const reorderedWithNewOrder = reordered.map((p, index) => ({ ...p, order: index }));
    
    // Merge with other products not in this section
    const otherProducts = data.products.filter(p => !currentSection?.productIds.includes(p.id));
    const allProducts = [...otherProducts, ...reorderedWithNewOrder];
    
    onDataChange({ ...data, products: allProducts });
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

  if (data.sections.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-muted-foreground">
          Nenhuma seção criada ainda. Vá para a aba "Seções" e crie uma seção primeiro.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Produtos do Cardápio</h3>
        <Button onClick={() => setIsCreating(true)} disabled={!selectedSection}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Produto
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Seção</Label>
        <select
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
          className="w-full p-2 border rounded-md bg-background"
        >
          {data.sections.sort((a, b) => a.order - b.order).map(section => (
            <option key={section.id} value={section.id}>
              {section.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          Produtos serão adicionados nesta seção
        </p>
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
