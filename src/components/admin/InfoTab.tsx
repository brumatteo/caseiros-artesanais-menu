import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AppData } from '@/types';
import { ImageUpload } from './ImageUpload';

interface InfoTabProps {
  data: AppData;
  onDataChange: (data: AppData) => void;
}

export function InfoTab({ data, onDataChange }: InfoTabProps) {
  const updateSettings = (updates: Partial<typeof data.settings>) => {
    onDataChange({
      ...data,
      settings: { ...data.settings, ...updates }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Seção "Sobre"</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Mostrar seção "Sobre"</Label>
            <Switch
              checked={data.settings.showAbout}
              onCheckedChange={(checked) => updateSettings({ showAbout: checked })}
            />
          </div>

          {data.settings.showAbout && (
            <>
              <div>
                <Label>Título</Label>
                <Input
                  value={data.settings.aboutTitle}
                  onChange={(e) => updateSettings({ aboutTitle: e.target.value })}
                />
              </div>

              <div>
                <Label>Texto</Label>
                <Textarea
                  value={data.settings.aboutText}
                  onChange={(e) => updateSettings({ aboutText: e.target.value })}
                  rows={4}
                />
              </div>

              <ImageUpload
                label="Foto (opcional)"
                currentImage={data.settings.aboutImage}
                onImageChange={(image) => updateSettings({ aboutImage: image })}
              />
            </>
          )}
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Informações Extras</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Mostrar informações extras</Label>
            <Switch
              checked={data.settings.showExtraInfo}
              onCheckedChange={(checked) => updateSettings({ showExtraInfo: checked })}
            />
          </div>

          {data.settings.showExtraInfo && (
            <div>
              <Label>Texto (políticas, retirada, entrega, etc.)</Label>
              <Textarea
                value={data.settings.extraInfoText}
                onChange={(e) => updateSettings({ extraInfoText: e.target.value })}
                rows={5}
                placeholder="• Retirada no local ou entrega (consulte taxa)&#10;• Prazo mínimo: 48h de antecedência"
              />
            </div>
          )}
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Rodapé</h3>
        
        <div className="space-y-4">
          <div>
            <Label>Texto do rodapé</Label>
            <Input
              value={data.settings.footerText}
              onChange={(e) => updateSettings({ footerText: e.target.value })}
            />
          </div>

          <div>
            <Label>Instagram (URL completa, opcional)</Label>
            <Input
              value={data.settings.instagramUrl || ''}
              onChange={(e) => updateSettings({ instagramUrl: e.target.value })}
              placeholder="https://instagram.com/seu_perfil"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
