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
import { supabase } from '@/integrations/supabase/client';
import { compressBase64Image } from '@/lib/utils';
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
    if (isSaving) return;

    try {
      setIsSaving(true);

      if (!bakeryId) {
        toast({
          title: "Erro",
          description: "ID da confeitaria não encontrado",
          variant: "destructive"
        });
        return;
      }

      // Verificar sessão
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        toast({
          title: "Sessão expirada",
          description: "Por favor, faça login novamente",
          variant: "destructive"
        });
        onLogout();
        return;
      }

      // Comprimir imagens
      const dataToSave = { ...data };
      
      if (dataToSave.settings?.logoImage?.startsWith('data:image')) {
        dataToSave.settings.logoImage = await compressBase64Image(dataToSave.settings.logoImage, 400);
      }
      if (dataToSave.settings?.heroImage?.startsWith('data:image')) {
        dataToSave.settings.heroImage = await compressBase64Image(dataToSave.settings.heroImage, 1200);
      }

      for (const product of dataToSave.products || []) {
        if (product.image?.startsWith('data:image')) {
          product.image = await compressBase64Image(product.image, 600);
        }
      }

      for (const extra of dataToSave.extras || []) {
        if (extra.image?.startsWith('data:image')) {
          extra.image = await compressBase64Image(extra.image, 600);
        }
      }

      // Refresh do token
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError || !refreshData.session) {
        toast({
          title: "Erro de autenticação",
          description: "Sua sessão expirou. Por favor, faça login novamente.",
          variant: "destructive"
        });
        onLogout();
        return;
      }

      // Salvar dados
      const success = await saveDataToSupabase(dataToSave, bakeryId);

      if (success) {
        toast({
          title: "Sucesso!",
          description: "Alterações salvas com sucesso",
        });
      }
    } catch (error: any) {
      console.error('❌ Erro ao salvar:', error);
      
      if (error?.message?.includes('JWT') || error?.message?.includes('sessão') || error?.message?.includes('Session')) {
        toast({
          title: "Sessão expirada",
          description: "Por favor, faça login novamente",
          variant: "destructive"
        });
        onLogout();
        return;
      }

      toast({
        title: "Erro ao salvar",
        description: error.message || "Ocorreu um erro ao salvar os dados",
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