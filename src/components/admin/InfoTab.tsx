import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AppData } from '@/types';
import { ImageUpload } from './ImageUpload';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface InfoTabProps {
  data: AppData;
  onDataChange: (data: AppData) => void;
  bakeryId?: string;
}

export function InfoTab({ data, onDataChange, bakeryId }: InfoTabProps) {
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
        console.error('❌ Erro ao salvar informações:', error);
        toast({ 
          title: "Erro ao salvar", 
          description: "Não foi possível salvar as informações.",
          variant: "destructive" 
        });
      } else {
        console.log('✅ Informações salvas automaticamente:', updates);
      }
    }
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
        <h3 className="text-lg font-semibold mb-4">Informações Adicionais</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Mostrar informações adicionais</Label>
            <Switch
              checked={data.settings.showExtraInfo}
              onCheckedChange={(checked) => updateSettings({ showExtraInfo: checked })}
            />
          </div>

          {data.settings.showExtraInfo && (
            <>
              <div>
                <Label>Título da Seção</Label>
                <Input
                  value={data.settings.extraInfoTitle || 'Informações Adicionais'}
                  onChange={(e) => updateSettings({ extraInfoTitle: e.target.value })}
                />
              </div>
              
              <div>
                <Label>Texto (políticas, retirada, entrega, etc.)</Label>
                <Textarea
                  value={data.settings.extraInfoText}
                  onChange={(e) => updateSettings({ extraInfoText: e.target.value })}
                  rows={5}
                  placeholder="• Retirada no local ou entrega (consulte taxa)&#10;• Prazo mínimo: 48h de antecedência"
                />
              </div>
            </>
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
            <Label>Endereço (opcional)</Label>
            <Input
              value={data.settings.footerAddress || ''}
              onChange={(e) => updateSettings({ footerAddress: e.target.value })}
              placeholder="Rua Exemplo, 123 - Bairro - Cidade/UF"
            />
          </div>

          <div>
            <Label>Telefone / WhatsApp (opcional)</Label>
            <Input
              value={data.settings.footerPhone || ''}
              onChange={(e) => updateSettings({ footerPhone: e.target.value })}
              placeholder="(11) 99999-9999"
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
