import { useState } from 'react';
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AppData, Extra } from '@/types';
import { ImageUpload } from './ImageUpload';

interface ExtrasTabProps {
  data: AppData;
  onDataChange: (data: AppData) => void;
}

export function ExtrasTab({ data, onDataChange }: ExtrasTabProps) {
  const [editingExtra, setEditingExtra] = useState<Extra | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState<string>();
  const [showImage, setShowImage] = useState(true);

  const sortedExtras = [...data.extras].sort((a, b) => a.order - b.order);

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice(0);
    setImage(undefined);
    setShowImage(true);
    setEditingExtra(null);
    setIsCreating(false);
  };

  const startEdit = (extra: Extra) => {
    setEditingExtra(extra);
    setName(extra.name);
    setDescription(extra.description);
    setPrice(extra.price);
    setImage(extra.image);
    setShowImage(extra.showImage !== false);
    setIsCreating(false);
  };

  const startCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  const handleSave = () => {
    if (!name.trim() || price <= 0) {
      alert('Preencha nome e preço.');
      return;
    }

    const extraData: Extra = {
      id: editingExtra?.id || `e${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      price,
      image,
      showImage,
      order: editingExtra?.order || Date.now(),
    };

    const updatedExtras = editingExtra
      ? data.extras.map(e => e.id === extraData.id ? extraData : e)
      : [...data.extras, extraData];

    onDataChange({ ...data, extras: updatedExtras });
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Remover esta cobertura/extra?')) {
      onDataChange({ ...data, extras: data.extras.filter(e => e.id !== id) });
    }
  };

  const handleMove = (id: string, direction: 'up' | 'down') => {
    const currentIndex = sortedExtras.findIndex(e => e.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= sortedExtras.length) return;

    const reordered = [...sortedExtras];
    [reordered[currentIndex], reordered[newIndex]] = [reordered[newIndex], reordered[currentIndex]];

    const updatedExtras = reordered.map((e, index) => ({ ...e, order: index + 1 }));
    onDataChange({ ...data, extras: updatedExtras });
  };

  if (editingExtra || isCreating) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            {editingExtra ? 'Editar Cobertura/Extra' : 'Nova Cobertura/Extra'}
          </h3>
          <Button variant="ghost" size="icon" onClick={resetForm}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Nome *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <Label>Descrição</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>

          <div>
            <Label>Preço *</Label>
            <Input
              type="number"
              value={price || ''}
              onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
              step="0.01"
            />
          </div>

          <div>
            <ImageUpload
              label="Foto"
              currentImage={image}
              onImageChange={setImage}
            />
            <div className="flex items-center gap-2 mt-2">
              <Switch
                id="show-extra-image"
                checked={showImage}
                onCheckedChange={setShowImage}
              />
              <Label htmlFor="show-extra-image" className="text-sm cursor-pointer">
                Ativar imagem desta cobertura/extra
              </Label>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              💡 Recomendado: imagens horizontais ou levemente verticais (proporção aproximada 1:1.2), resolução mínima 800x800px
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button onClick={handleSave} className="flex-1">Salvar</Button>
          <Button onClick={resetForm} variant="outline">Cancelar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Coberturas e Extras</h3>
        <Button onClick={startCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar
        </Button>
      </div>

      <div className="space-y-3">
        {sortedExtras.map((extra, index) => (
          <div key={extra.id} className="bg-accent/50 rounded-lg p-4 flex items-center gap-4">
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleMove(extra.id, 'up')}
                disabled={index === 0}
                className="h-6 w-6"
              >
                <ArrowUp className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleMove(extra.id, 'down')}
                disabled={index === sortedExtras.length - 1}
                className="h-6 w-6"
              >
                <ArrowDown className="h-3 w-3" />
              </Button>
            </div>

            {extra.image && (
              <img src={extra.image} alt={extra.name} className="w-16 h-16 object-cover rounded" />
            )}

            <div className="flex-1">
              <h4 className="font-semibold">{extra.name}</h4>
              <p className="text-sm text-muted-foreground">{extra.description}</p>
              <p className="text-sm font-medium text-primary mt-1">R$ {extra.price.toFixed(2)}</p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => startEdit(extra)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => handleDelete(extra.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
