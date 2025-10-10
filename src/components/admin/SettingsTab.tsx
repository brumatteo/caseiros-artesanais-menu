import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AppData } from '@/types';
import { toast } from '@/hooks/use-toast';

interface SettingsTabProps {
  data: AppData;
  onDataChange: (data: AppData) => void;
}

export function SettingsTab({ data, onDataChange }: SettingsTabProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const updateSettings = (updates: Partial<typeof data.settings>) => {
    onDataChange({
      ...data,
      settings: { ...data.settings, ...updates }
    });
  };

  const handlePasswordChange = () => {
    if (newPassword.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "Por favor, confirme a senha corretamente.",
        variant: "destructive",
      });
      return;
    }

    updateSettings({ adminPassword: newPassword });
    setNewPassword('');
    setConfirmPassword('');
    
    toast({
      title: "Senha alterada!",
      description: "Sua nova senha foi salva com sucesso.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Contato</h3>
        
        <div>
          <Label>Número do WhatsApp (com código do país)</Label>
          <Input
            value={data.settings.whatsappNumber}
            onChange={(e) => updateSettings({ whatsappNumber: e.target.value })}
            placeholder="5511999999999"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Formato: código do país + DDD + número (ex: 5511999999999)
          </p>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Segurança</h3>
        
        <div className="space-y-4">
          <div>
            <Label>Nova Senha</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div>
            <Label>Confirmar Nova Senha</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Digite novamente"
            />
          </div>

          <Button onClick={handlePasswordChange}>
            Alterar Senha
          </Button>
        </div>
      </div>
    </div>
  );
}
