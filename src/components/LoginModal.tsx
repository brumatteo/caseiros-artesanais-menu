import { useState } from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string, password: string) => boolean;
}

export function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const success = onLogin(username, password);
    if (success) {
      setUsername('');
      setPassword('');
      // Don't call onClose() - let parent component handle modal state
    } else {
      setError('Usuário ou senha incorretos');
    }
  };

  const handleForgotPassword = async () => {
    if (!username) {
      toast({
        title: "Digite seu e-mail",
        description: "Por favor, digite seu e-mail no campo acima para recuperar sua senha.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(username, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast({
        title: "Erro ao enviar e-mail",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "E-mail enviado!",
        description: "Enviamos um link de redefinição para o seu e-mail.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Lock className="h-6 w-6 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl font-display">
            Acesso Restrito
          </DialogTitle>
          <DialogDescription className="text-center">
            ⚠️ Acesso restrito — apenas o administrador pode entrar nesta área.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Usuário</label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Senha</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full">
            Entrar
          </Button>

          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-sm text-primary hover:underline text-center w-full"
          >
            Esqueci minha senha
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
