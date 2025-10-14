import { useState } from 'react';
import { Plus, X, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Product, ProductSize, Tag } from '@/types';
import { ImageUpload } from './ImageUpload';
interface ProductEditorProps {
  product: Product | null;
  tags: Tag[];
  onSave: (product: Product) => void;
  onCancel: () => void;
}
export function ProductEditor({
  product,
  tags,
  onSave,
  onCancel
}: ProductEditorProps) {
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [image, setImage] = useState(product?.image);
  const [showImage, setShowImage] = useState(product?.showImage !== false);
  const [sizes, setSizes] = useState<ProductSize[]>(product?.sizes || [{
    id: '1',
    name: 'Médio',
    price: 50
  }]);
  const [selectedTags, setSelectedTags] = useState<string[]>(product?.tags || []);
  const handleAddSize = () => {
    const newId = crypto.randomUUID();
    setSizes([...sizes, {
      id: newId,
      name: '',
      price: 0
    }]);
  };
  const handleUpdateSize = (index: number, field: keyof ProductSize, value: string | number) => {
    const updated = [...sizes];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setSizes(updated);
  };
  const handleRemoveSize = (index: number) => {
    if (sizes.length > 1) {
      setSizes(sizes.filter((_, i) => i !== index));
    }
  };
  const handleMoveSize = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sizes.length) return;
    const updated = [...sizes];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setSizes(updated);
  };
  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]);
  };
  const handleSave = () => {
    if (!name.trim() || sizes.some(s => !s.name.trim() || s.price <= 0)) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    const productData: Product = {
      id: product?.id || crypto.randomUUID(),
      name: name.trim(),
      description: description.trim(),
      image,
      showImage,
      sizes,
      tags: selectedTags,
      order: product?.order || 0
    };
    onSave(productData);
  };
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          {product ? 'Editar Produto' : 'Novo Produto'}
        </h3>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Nome do Produto *</Label>
          <Input value={name} onChange={e => setName(e.target.value)} />
        </div>

        <div>
          <Label>Descrição</Label>
          <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} />
        </div>

        <div>
          <ImageUpload label="Foto do Produto" currentImage={image} onImageChange={setImage} />
          <div className="flex items-center gap-2 mt-2">
            <Switch id="show-image" checked={showImage} onCheckedChange={setShowImage} />
            <Label htmlFor="show-image" className="text-sm cursor-pointer">
              Ativar imagem deste produto
            </Label>
          </div>
          
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <Label>Tamanhos e Preços *</Label>
            <Button variant="outline" size="sm" onClick={handleAddSize}>
              <Plus className="h-3 w-3 mr-1" />
              Adicionar Tamanho
            </Button>
          </div>

          <div className="space-y-2">
            {sizes.map((size, index) => <div key={size.id} className="flex items-center gap-2 bg-background p-2 rounded">
                <div className="flex flex-col gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleMoveSize(index, 'up')} disabled={index === 0} className="h-6 w-6">
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleMoveSize(index, 'down')} disabled={index === sizes.length - 1} className="h-6 w-6">
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                </div>

                <Input placeholder="Nome (ex: Pequeno 15cm)" value={size.name} onChange={e => handleUpdateSize(index, 'name', e.target.value)} className="flex-1" />
                <Input type="number" placeholder="Preço" value={size.price || ''} onChange={e => handleUpdateSize(index, 'price', parseFloat(e.target.value) || 0)} className="w-24" step="0.01" />
                {sizes.length > 1 && <Button variant="ghost" size="icon" onClick={() => handleRemoveSize(index)}>
                    <X className="h-4 w-4" />
                  </Button>}
              </div>)}
          </div>
        </div>

        <div>
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map(tag => <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)} className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${selectedTags.includes(tag.id) ? 'text-white shadow-md' : 'bg-accent text-foreground opacity-50'}`} style={selectedTags.includes(tag.id) ? {
            backgroundColor: tag.color
          } : {}}>
                {tag.emoji && <span className="mr-1">{tag.emoji}</span>}
                {tag.name}
              </button>)}
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <Button onClick={handleSave} className="flex-1">Salvar Produto</Button>
        <Button onClick={onCancel} variant="outline">Cancelar</Button>
      </div>
    </div>;
}