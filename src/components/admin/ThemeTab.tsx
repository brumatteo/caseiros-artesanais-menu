import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AppData } from '@/types';

interface ThemeTabProps {
  data: AppData;
  onDataChange: (data: AppData) => void;
}

export function ThemeTab({ data, onDataChange }: ThemeTabProps) {
  const updateSettings = (updates: Partial<typeof data.settings>) => {
    onDataChange({
      ...data,
      settings: { ...data.settings, ...updates }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Cores do Site</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Personalize as cores do seu site. Use códigos hexadecimais (#) para definir cada cor.
        </p>
        
        <div className="space-y-4">
          <div>
            <Label>Cor Primária (botões, links, destaques)</Label>
            <div className="flex items-center gap-3">
              <Input
                type="color"
                value={data.settings.colorPrimary || '#E88D95'}
                onChange={(e) => updateSettings({ colorPrimary: e.target.value })}
                className="w-20 h-10"
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
                className="w-20 h-10"
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
                className="w-20 h-10"
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
                value={data.settings.colorBackground || '#FFFFFF'}
                onChange={(e) => updateSettings({ colorBackground: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={data.settings.colorBackground || '#FFFFFF'}
                onChange={(e) => updateSettings({ colorBackground: e.target.value })}
                placeholder="#FFFFFF"
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label>Cor do Texto (texto principal)</Label>
            <div className="flex items-center gap-3">
              <Input
                type="color"
                value={data.settings.colorForeground || '#1A1A1A'}
                onChange={(e) => updateSettings({ colorForeground: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={data.settings.colorForeground || '#1A1A1A'}
                onChange={(e) => updateSettings({ colorForeground: e.target.value })}
                placeholder="#1A1A1A"
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
        <p className="font-semibold mb-2">💡 Dica:</p>
        <p>
          As cores serão aplicadas automaticamente em todo o site. 
          Experimente diferentes combinações para criar a identidade visual perfeita para seu negócio.
        </p>
      </div>
    </div>
  );
}
