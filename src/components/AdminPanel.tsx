import { useState } from 'react';
import { X, Save, Download, Upload, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppData } from '@/types';
import { exportData, importData, saveData, checkStorageUsage } from '@/lib/storage';
import { toast } from '@/hooks/use-toast';
import { BrandingTab } from './admin/BrandingTab';
import { ProductsTab } from './admin/ProductsTab';
import { ExtrasTab } from './admin/ExtrasTab';
import { InfoTab } from './admin/InfoTab';
import { SettingsTab } from './admin/SettingsTab';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  data: AppData;
  onDataChange: (data: AppData) => void;
  onLogout: () => void;
}

export function AdminPanel({ isOpen, onClose, data, onDataChange, onLogout }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState('branding');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    try {
      const saved = saveData(data);
      
      if (!saved) {
        toast({
          title: "Erro ao salvar",
          description: "Dados muito grandes. Reduza o tamanho das imagens (use imagens menores que 500KB).",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }
      
      toast({
        title: "Salvo com sucesso!",
        description: "Suas alterações foram salvas.",
      });
      
      const usage = checkStorageUsage();
      if (usage.percentage > 70) {
        toast({
          title: "Atenção: Espaço de armazenamento",
          description: `Você está usando ${usage.percentage.toFixed(0)}% do espaço. Use imagens menores ou exporte um backup.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    try {
      const jsonData = exportData();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-bolos-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Backup exportado!",
        description: "Seu backup foi baixado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível exportar o backup.",
        variant: "destructive",
      });
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        importData(text);
        const newData = JSON.parse(text);
        onDataChange(newData);
        
        toast({
          title: "Backup importado!",
          description: "Seus dados foram restaurados com sucesso.",
        });
      } catch (error) {
        toast({
          title: "Erro ao importar",
          description: "Arquivo inválido. Verifique o formato.",
          variant: "destructive",
        });
      }
    };
    input.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">Painel Administrativo</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="branding">Marca & Banner</TabsTrigger>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="extras">Coberturas</TabsTrigger>
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="branding">
              <BrandingTab data={data} onDataChange={onDataChange} />
            </TabsContent>

            <TabsContent value="products">
              <ProductsTab data={data} onDataChange={onDataChange} />
            </TabsContent>

            <TabsContent value="extras">
              <ExtrasTab data={data} onDataChange={onDataChange} />
            </TabsContent>

            <TabsContent value="info">
              <InfoTab data={data} onDataChange={onDataChange} />
            </TabsContent>

            <TabsContent value="settings">
              <SettingsTab data={data} onDataChange={onDataChange} />
            </TabsContent>
          </div>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 border-t pt-4 mt-4">
          <Button onClick={handleSave} disabled={isSaving} className="flex-1 min-w-[150px]">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
          
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar Backup
          </Button>
          
          <Button onClick={handleImport} variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Importar Backup
          </Button>

          <Button onClick={onLogout} variant="destructive">
            Sair
          </Button>
        </div>

        <div className="bg-muted/50 rounded-lg p-3 flex items-start gap-2 text-sm">
          <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-muted-foreground">
            As alterações são salvas no navegador. Recomendamos exportar backups regularmente.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
