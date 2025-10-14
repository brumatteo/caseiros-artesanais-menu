import { useState } from 'react';
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AppData, ProductSection } from '@/types';

interface SectionsTabProps {
  data: AppData;
  onDataChange: (data: AppData) => void;
}

export function SectionsTab({ data, onDataChange }: SectionsTabProps) {
  const [editingSection, setEditingSection] = useState<ProductSection | null>(null);
  const [editingName, setEditingName] = useState('');

  const sortedSections = [...data.sections].sort((a, b) => a.order - b.order);

  const handleAddSection = () => {
    const newSection: ProductSection = {
      id: crypto.randomUUID(),
      name: 'Nova Seção',
      visible: true,
      order: data.sections.length,
      productIds: [],
    };
    onDataChange({ ...data, sections: [...data.sections, newSection] });
  };

  const handleDeleteSection = (id: string) => {
    if (confirm('Tem certeza que deseja remover esta seção?')) {
      onDataChange({
        ...data,
        sections: data.sections.filter(s => s.id !== id)
      });
    }
  };

  const handleMoveSection = (id: string, direction: 'up' | 'down') => {
    const currentIndex = sortedSections.findIndex(s => s.id === id);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= sortedSections.length) return;

    const reordered = [...sortedSections];
    [reordered[currentIndex], reordered[newIndex]] = [reordered[newIndex], reordered[currentIndex]];
    
    const updatedSections = reordered.map((s, index) => ({ ...s, order: index + 1 }));
    onDataChange({ ...data, sections: updatedSections });
  };

  const handleToggleVisibility = (id: string) => {
    const updatedSections = data.sections.map(s => 
      s.id === id ? { ...s, visible: !s.visible } : s
    );
    onDataChange({ ...data, sections: updatedSections });
  };

  const handleSaveName = (id: string) => {
    const updatedSections = data.sections.map(s => 
      s.id === id ? { ...s, name: editingName } : s
    );
    onDataChange({ ...data, sections: updatedSections });
    setEditingSection(null);
    setEditingName('');
  };

  const startEditing = (section: ProductSection) => {
    setEditingSection(section);
    setEditingName(section.name);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Seções de Produtos</h3>
          <p className="text-sm text-muted-foreground">
            Organize seu cardápio em seções como "Bolos", "Doces", "Tortas", etc.
          </p>
        </div>
        <Button onClick={handleAddSection}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Seção
        </Button>
      </div>

      {sortedSections.length === 0 && (
        <div className="text-center py-8 bg-accent/30 rounded-lg">
          <p className="text-muted-foreground">
            Nenhuma seção criada ainda. Clique em "Adicionar Seção" para começar!
          </p>
        </div>
      )}

      <div className="space-y-3">
        {sortedSections.map((section, index) => (
          <div key={section.id} className="bg-accent/50 rounded-lg p-4 flex items-center gap-4">
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleMoveSection(section.id, 'up')}
                disabled={index === 0}
                className="h-6 w-6"
              >
                <ArrowUp className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleMoveSection(section.id, 'down')}
                disabled={index === sortedSections.length - 1}
                className="h-6 w-6"
              >
                <ArrowDown className="h-3 w-3" />
              </Button>
            </div>

            <div className="flex-1">
              {editingSection?.id === section.id ? (
                <div className="space-y-2">
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    placeholder="Nome da seção"
                  />
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleSaveName(section.id)}
                    >
                      Salvar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setEditingSection(null);
                        setEditingName('');
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <h4 className="font-semibold">{section.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {section.productIds.length} produto(s) • {section.visible ? 'Visível' : 'Oculta'}
                  </p>
                </>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleToggleVisibility(section.id)}
                title={section.visible ? 'Ocultar seção' : 'Mostrar seção'}
              >
                {section.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => startEditing(section)}
                disabled={editingSection?.id === section.id}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleDeleteSection(section.id)}
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
