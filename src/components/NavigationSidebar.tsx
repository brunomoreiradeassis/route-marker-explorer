
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Map, Settings, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const NavigationSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, userProfile } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso"
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao fazer logout",
        variant: "destructive"
      });
    }
  };

  const menuItems = [
    {
      title: "Mapa",
      icon: Map,
      path: "/",
      onClick: () => navigate('/')
    },
    {
      title: "Configurações",
      icon: Settings,
      path: "/settings",
      onClick: () => navigate('/settings')
    }
  ];

  return (
    <div className="w-16 border-r bg-sidebar text-sidebar-foreground flex flex-col">
      <div className="p-2 border-b">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-primary-foreground" />
          </div>
        </div>
      </div>
      
      <div className="p-2 flex-1">
        <div className="space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.title}
              variant={location.pathname === item.path ? "default" : "ghost"}
              size="sm"
              onClick={item.onClick}
              className="w-full h-12 flex flex-col items-center justify-center gap-1"
              title={item.title}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.title}</span>
            </Button>
          ))}
        </div>
      </div>
      
      <div className="mt-auto p-2 border-t">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full h-12 flex flex-col items-center justify-center gap-1"
          title="Sair"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-xs">Sair</span>
        </Button>
      </div>
    </div>
  );
};

export default NavigationSidebar;
