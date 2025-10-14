import { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AppData, Tag } from '@/types';

interface TagsTabProps {
  data: AppData;
  onDataChange: (data: AppData) => void;
}

// Tags sugeridas padrão
const DEFAULT_TAGS: Omit<Tag, 'id'>[] = [
  { name: 'Novidade', color: '#10b981', emoji: '✨' },
  { name: 'Destaque', color: '#f59e0b', emoji: '⭐' },
  { name: 'Promoção', color: '#ef4444', emoji: '🔥' },
  { name: 'Vegano', color: '#22c55e', emoji: '🌱' },
  { name: 'Sem Glúten', color: '#8b5cf6', emoji: '🌾' },
  { name: 'Mais Vendido', color: '#ec4899', emoji: '💖' },
  { name: 'Lançamento', color: '#3b82f6', emoji: '🎉' },
];

export function TagsTab({ data, onDataChange }: TagsTabProps) {
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editEmoji, setEditEmoji] = useState('');

  // Adicionar tags sugeridas automaticamente se ainda não existirem
  useState(() => {
    if (data.tags.length === 0) {
      const defaultTags = DEFAULT_TAGS.map(t => ({
        ...t,
        id: crypto.randomUUID(),
      }));
      onDataChange({
        ...data,
        tags: defaultTags,
      });
    }
  });

  const handleAddCustomTag = () => {
    const newTag: Tag = {
      id: crypto.randomUUID(),
      name: 'Nova Tag',
      color: '#6366f1',
      emoji: '🏷️',
    };

    onDataChange({
      ...data,
      tags: [...data.tags, newTag],
    });

    setEditingTag(newTag.id);
    setEditName(newTag.name);
    setEditColor(newTag.color);
    setEditEmoji(newTag.emoji || '');
  };

  const handleDeleteTag = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta tag?')) {
      onDataChange({
        ...data,
        tags: data.tags.filter(t => t.id !== id),
      });
    }
  };

  const startEditing = (tag: Tag) => {
    setEditingTag(tag.id);
    setEditName(tag.name);
    setEditColor(tag.color);
    setEditEmoji(tag.emoji || '');
  };

  const handleSaveTag = () => {
    if (!editingTag) return;

    onDataChange({
      ...data,
      tags: data.tags.map(t =>
        t.id === editingTag
          ? { ...t, name: editName, color: editColor, emoji: editEmoji }
          : t
      ),
    });

    setEditingTag(null);
  };

  const cancelEditing = () => {
    setEditingTag(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Tags de Produtos</h3>
          <p className="text-sm text-muted-foreground">
            Tags sugeridas já estão ativas. Você pode editá-las ou criar novas.
          </p>
        </div>
        <Button onClick={handleAddCustomTag} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nova Tag Personalizada
        </Button>
      </div>

      {data.tags.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>Nenhuma tag cadastrada.</p>
          <p className="text-sm mt-2">Clique em "Adicionar Tags Sugeridas" para começar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.tags.map(tag => (
            <div
              key={tag.id}
              className="bg-card border rounded-lg p-4 space-y-3"
            >
              {editingTag === tag.id ? (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs">Nome</Label>
                    <Input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      placeholder="Nome da tag"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Emoji</Label>
                    <Input
                      value={editEmoji}
                      onChange={e => setEditEmoji(e.target.value)}
                      placeholder="Ex: ✨"
                      maxLength={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Cor</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={editColor}
                        onChange={e => setEditColor(e.target.value)}
                        className="w-16 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={editColor}
                        onChange={e => setEditColor(e.target.value)}
                        placeholder="#000000"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button onClick={handleSaveTag} size="sm" className="flex-1">
                      <Check className="h-3 w-3 mr-1" />
                      Salvar
                    </Button>
                    <Button onClick={cancelEditing} variant="outline" size="sm">
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div
                      className="px-3 py-1.5 rounded-full text-sm font-semibold text-white inline-flex items-center gap-1"
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.emoji && <span>{tag.emoji}</span>}
                      <span>{tag.name}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => startEditing(tag)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Edit2 className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      onClick={() => handleDeleteTag(tag.id)}
                      variant="ghost"
                      size="sm"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
