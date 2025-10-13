import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AppData } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ThemeTabProps {
  data: AppData;
  onDataChange: (data: AppData) => void;
  bakeryId?: string;
}

export function ThemeTab({ data, onDataChange, bakeryId }: ThemeTabProps) {
  const updateSettings = async (updates: Partial<typeof data.settings>) => {
    const newSettings = { ...data.settings, ...updates };
    
    // Atualiza estado local
    onDataChange({
      ...data,
      settings: newSettings
    });
    
    // Salva no Supabase
    if (bakeryId) {
      const { error } = await supabase
        .from('bakeries')
        .update({ 
          settings: newSettings,
          updated_at: new Date().toISOString()
        })
        .eq('id', bakeryId);
        
      if (error) {
        console.error('❌ Erro ao salvar cores:', error);
        toast({ 
          title: "Erro ao salvar", 
          description: "Não foi possível salvar as cores.",
          variant: "destructive" 
        });
      } else {
        console.log('✅ Cores salvas automaticamente:', updates);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Cores do Site</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Personalize as cores do seu site. As alterações são aplicadas em tempo real.
        </p>
        
        <div className="space-y-4">
          <div>
            <Label>Cor Primária (botões, links, destaques)</Label>
            <div className="flex items-center gap-3">
              <Input
                type="color"
                value={data.settings.colorPrimary || '#E88D95'}
                onChange={(e) => updateSettings({ colorPrimary: e.target.value })}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                type="text"
                value={data.settings.colorPrimary || '#E88D95'}
                onChange={(e) => updateSettings({ colorPrimary: e.target.value })}
                placeholder="#E88D95"
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label>Cor Secundária (elementos de apoio)</Label>
            <div className="flex items-center gap-3">
              <Input
                type="color"
                value={data.settings.colorSecondary || '#9DC4A8'}
                onChange={(e) => updateSettings({ colorSecondary: e.target.value })}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                type="text"
                value={data.settings.colorSecondary || '#9DC4A8'}
                onChange={(e) => updateSettings({ colorSecondary: e.target.value })}
                placeholder="#9DC4A8"
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label>Cor de Destaque (seções especiais)</Label>
            <div className="flex items-center gap-3">
              <Input
                type="color"
                value={data.settings.colorAccent || '#E8C89D'}
                onChange={(e) => updateSettings({ colorAccent: e.target.value })}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                type="text"
                value={data.settings.colorAccent || '#E8C89D'}
                onChange={(e) => updateSettings({ colorAccent: e.target.value })}
                placeholder="#E8C89D"
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label>Cor de Fundo (fundo das páginas)</Label>
            <div className="flex items-center gap-3">
              <Input
                type="color"
                value={data.settings.colorBackground || '#F5F1ED'}
                onChange={(e) => updateSettings({ colorBackground: e.target.value })}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                type="text"
                value={data.settings.colorBackground || '#F5F1ED'}
                onChange={(e) => updateSettings({ colorBackground: e.target.value })}
                placeholder="#F5F1ED"
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label>Cor do Texto (texto principal)</Label>
            <div className="flex items-center gap-3">
              <Input
                type="color"
                value={data.settings.colorForeground || '#3D2E27'}
                onChange={(e) => updateSettings({ colorForeground: e.target.value })}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                type="text"
                value={data.settings.colorForeground || '#3D2E27'}
                onChange={(e) => updateSettings({ colorForeground: e.target.value })}
                placeholder="#3D2E27"
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
        <p className="font-semibold mb-2">💡 Dica:</p>
        <p>
          As cores são aplicadas automaticamente em todo o site em tempo real. 
          Experimente diferentes combinações para criar a identidade visual perfeita!
        </p>
      </div>
    </div>
  );
}
