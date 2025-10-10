import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { AppData } from '@/types';
import { ImageUpload } from './ImageUpload';

interface BrandingTabProps {
  data: AppData;
  onDataChange: (data: AppData) => void;
}

export function BrandingTab({ data, onDataChange }: BrandingTabProps) {
  const updateSettings = (updates: Partial<typeof data.settings>) => {
    onDataChange({
      ...data,
      settings: { ...data.settings, ...updates }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Identidade da Marca</h3>
        
        <div className="space-y-4">
          <div>
            <Label>Nome da Marca</Label>
            <Input
              value={data.settings.brandName}
              onChange={(e) => updateSettings({ brandName: e.target.value })}
              placeholder="Bolos Caseirinhos"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Mostrar nome na navbar</Label>
            <Switch
              checked={data.settings.showName}
              onCheckedChange={(checked) => updateSettings({ showName: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Mostrar logo na navbar</Label>
            <Switch
              checked={data.settings.showLogo}
              onCheckedChange={(checked) => updateSettings({ showLogo: checked })}
            />
          </div>

          {data.settings.showLogo && (
            <ImageUpload
              label="Logo da Navbar (será cortado em círculo)"
              currentImage={data.settings.logoImage}
              onImageChange={(image) => updateSettings({ logoImage: image })}
              circular
            />
          )}
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Banner Hero</h3>
        
        <div className="space-y-4">
          <ImageUpload
            label="Imagem de Fundo do Banner"
            currentImage={data.settings.heroImage}
            onImageChange={(image) => updateSettings({ heroImage: image })}
          />

          <div>
            <Label>Título do Banner</Label>
            <Textarea
              value={data.settings.heroTitle}
              onChange={(e) => updateSettings({ heroTitle: e.target.value })}
              rows={2}
            />
          </div>

          <div>
            <Label>Subtítulo (opcional)</Label>
            <Input
              value={data.settings.heroSubtitle}
              onChange={(e) => updateSettings({ heroSubtitle: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Mostrar logo no banner</Label>
            <Switch
              checked={data.settings.showHeroLogo}
              onCheckedChange={(checked) => updateSettings({ showHeroLogo: checked })}
            />
          </div>

          {data.settings.showHeroLogo && (
            <ImageUpload
              label="Logo do Banner (será cortado em círculo)"
              currentImage={data.settings.heroLogoImage}
              onImageChange={(image) => updateSettings({ heroLogoImage: image })}
              circular
            />
          )}

          <div>
            <Label>Cor do Overlay</Label>
            <div className="flex items-center gap-3">
              <Input
                type="color"
                value={data.settings.heroOverlayColor}
                onChange={(e) => updateSettings({ heroOverlayColor: e.target.value })}
                className="w-20 h-10"
              />
              <span className="text-sm text-muted-foreground">
                {data.settings.heroOverlayColor}
              </span>
            </div>
          </div>

          <div>
            <Label>Opacidade do Overlay: {(data.settings.heroOverlayOpacity * 100).toFixed(0)}%</Label>
            <Slider
              value={[data.settings.heroOverlayOpacity * 100]}
              onValueChange={([value]) => updateSettings({ heroOverlayOpacity: value / 100 })}
              min={0}
              max={100}
              step={5}
              className="mt-2"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
