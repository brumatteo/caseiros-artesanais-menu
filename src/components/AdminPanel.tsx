import { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppData } from '@/types';
import { toast } from '@/hooks/use-toast';
import { BrandingTab } from './admin/BrandingTab';
import { ProductsTab } from './admin/ProductsTab';
import { InfoTab } from './admin/InfoTab';
import { ThemeTab } from './admin/ThemeTab';
import { SectionsTab } from './admin/SectionsTab';
import { SettingsTab } from './admin/SettingsTab';
import { TagsTab } from './admin/TagsTab';
import { saveDataToSupabase } from '@/lib/supabaseStorage';
interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  data: AppData;
  onDataChange: (data: AppData) => void;
  onLogout: () => void;
  userSlug?: string;
  bakeryId?: string;
}
export function AdminPanel({
  isOpen,
  onClose,
  data,
  onDataChange,
  onLogout,
  userSlug,
  bakeryId
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState('branding');
  const [isSaving, setIsSaving] = useState(false);
  const handleSave = async () => {
    if (!bakeryId) {
      console.error('❌ Erro: bakeryId não fornecido');
      toast({
        title: "Erro ao salvar",
        description: "ID da confeitaria não encontrado.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    console.log('🔄 Iniciando salvamento...', { bakeryId, data });
    
    try {
      const saved = await saveDataToSupabase(data, bakeryId);
      
      if (!saved) {
        console.error('❌ Salvamento falhou');
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar as alterações. Verifique o console para detalhes.",
          variant: "destructive"
        });
        setIsSaving(false);
        return;
      }
      
      console.log('✅ Salvamento concluído com sucesso!');
      toast({
        title: "Salvo com sucesso!",
        description: "Suas alterações foram salvas no banco de dados."
      });
    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro inesperado. Verifique o console para detalhes.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">Painel Administrativo</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-7 w-full">
            <TabsTrigger value="branding">Marca</TabsTrigger>
            <TabsTrigger value="theme">Cores</TabsTrigger>
            <TabsTrigger value="sections">Seções</TabsTrigger>
            <TabsTrigger value="tags">Tags</TabsTrigger>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="settings">Config</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="branding">
              <BrandingTab data={data} onDataChange={onDataChange} bakeryId={bakeryId} />
            </TabsContent>

            <TabsContent value="theme">
              <ThemeTab data={data} onDataChange={onDataChange} bakeryId={bakeryId} />
            </TabsContent>

            <TabsContent value="sections">
              <SectionsTab data={data} onDataChange={onDataChange} />
            </TabsContent>

            <TabsContent value="tags">
              <TagsTab data={data} onDataChange={onDataChange} />
            </TabsContent>

            <TabsContent value="products">
              <ProductsTab data={data} onDataChange={onDataChange} />
            </TabsContent>

            <TabsContent value="info">
              <InfoTab data={data} onDataChange={onDataChange} bakeryId={bakeryId} />
            </TabsContent>

            <TabsContent value="settings">
              <SettingsTab data={data} onDataChange={onDataChange} bakeryId={bakeryId} />
            </TabsContent>
          </div>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 border-t pt-4 mt-4">
          {userSlug && (
            <Button
              onClick={() => window.open(`/${userSlug}`, '_blank')}
              variant="outline"
              className="flex-1 min-w-[150px]"
            >
              Ver Meu Site
            </Button>
          )}
          
          <Button onClick={handleSave} disabled={isSaving} className="flex-1 min-w-[150px]">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>

          <Button onClick={onLogout} variant="destructive">
            <X className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>

        
      </DialogContent>
    </Dialog>;
}