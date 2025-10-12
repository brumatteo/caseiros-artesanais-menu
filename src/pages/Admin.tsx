import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminPanel } from '@/components/AdminPanel';
import { LoginModal } from '@/components/LoginModal';
import { getStoredData, saveData } from '@/lib/storage';
import { AppData } from '@/types';
import { toast } from '@/hooks/use-toast';
import { useThemeColors } from '@/hooks/useThemeColors';

const Admin = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<AppData>(getStoredData());
  const [isLoginOpen, setIsLoginOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useThemeColors(data.settings);

  useEffect(() => {
    const saved = saveData(data);
    if (!saved) {
      toast({
        title: "Aviso: Espaço de armazenamento",
        description: "Os dados estão muito grandes para salvar. Reduza o tamanho das imagens ou exporte um backup.",
        variant: "destructive",
      });
    }
  }, [data]);

  const handleLogin = (username: string, password: string): boolean => {
    if (username === 'admin' && password === data.settings.adminPassword) {
      setIsAuthenticated(true);
      setIsLoginOpen(false);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    toast({
      title: "Sessão encerrada",
      description: "Você saiu do painel administrativo.",
    });
    navigate('/');
  };

  const handleCloseLogin = () => {
    setIsLoginOpen(false);
    navigate('/');
  };

  const handleCloseAdmin = () => {
    navigate('/');
  };

  return (
    <>
      <LoginModal
        isOpen={isLoginOpen && !isAuthenticated}
        onClose={handleCloseLogin}
        onLogin={handleLogin}
      />

      <AdminPanel
        isOpen={isAuthenticated}
        onClose={handleCloseAdmin}
        data={data}
        onDataChange={setData}
        onLogout={handleLogout}
      />
    </>
  );
};

export default Admin;
