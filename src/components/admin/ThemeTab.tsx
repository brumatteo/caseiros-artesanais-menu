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
          Personalize as 2 cores principais do seu site. As alterações são aplicadas em tempo real.
        </p>
        
        <div className="space-y-4">
          <div>
            <Label>Cor de fundo do site (rosa claro)</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Sugestão: #FAF0F3 ou escolha sua cor preferida
            </p>
            <div className="flex items-center gap-3">
              <Input
                type="color"
                value={data.settings.colorBackgroundRosa || '#FAF0F3'}
                onChange={(e) => updateSettings({ colorBackgroundRosa: e.target.value })}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                type="text"
                value={data.settings.colorBackgroundRosa || ''}
                onChange={(e) => updateSettings({ colorBackgroundRosa: e.target.value })}
                placeholder="Ex: #FAF0F3"
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label>Cor de destaque dos botões</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Sugestão: #D9A5A0 ou escolha sua cor preferida
            </p>
            <div className="flex items-center gap-3">
              <Input
                type="color"
                value={data.settings.colorButtonPrimary || '#D9A5A0'}
                onChange={(e) => updateSettings({ colorButtonPrimary: e.target.value })}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                type="text"
                value={data.settings.colorButtonPrimary || ''}
                onChange={(e) => updateSettings({ colorButtonPrimary: e.target.value })}
                placeholder="Ex: #D9A5A0"
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
        <p className="font-semibold mb-2">💡 Dica:</p>
        <p>
          Essas 2 cores são aplicadas automaticamente em todo o site em tempo real. 
          As demais cores permanecem no padrão para garantir boa legibilidade.
        </p>
      </div>
    </div>
  );
}
