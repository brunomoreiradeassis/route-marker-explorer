
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { User, Settings, Lock } from 'lucide-react';

const UserSettings = () => {
  const { userData, updateUserProfile, changePassword } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    nomeCompleto: userData?.nomeCompleto || '',
    email: userData?.email || '',
    telefone: userData?.telefone || '',
    cpf: userData?.cpf || '',
    dataNascimento: userData?.dataNascimento || '',
    raioVisualizacao: userData?.raioVisualizacao || 10
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cpf') {
      formattedValue = formatCPF(value);
    } else if (name === 'telefone') {
      formattedValue = formatPhone(value);
    }

    setProfileData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  const handleRadiusChange = (value: number[]) => {
    setProfileData(prev => ({
      ...prev,
      raioVisualizacao: value[0]
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateUserProfile(profileData);
      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!"
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar perfil",
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }

    setPasswordLoading(true);

    try {
      await changePassword(passwordData.newPassword);
      setPasswordData({ newPassword: '', confirmPassword: '' });
      toast({
        title: "Sucesso",
        description: "Senha alterada com sucesso!"
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao alterar senha",
        variant: "destructive"
      });
    }
    
    setPasswordLoading(false);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <CardTitle>Configurações do Usuário</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">
                <User className="h-4 w-4 mr-2" />
                Perfil
              </TabsTrigger>
              <TabsTrigger value="preferences">
                <Settings className="h-4 w-4 mr-2" />
                Preferências
              </TabsTrigger>
              <TabsTrigger value="password">
                <Lock className="h-4 w-4 mr-2" />
                Senha
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nomeCompleto">Nome Completo</Label>
                    <Input
                      id="nomeCompleto"
                      name="nomeCompleto"
                      value={profileData.nomeCompleto}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      name="telefone"
                      value={profileData.telefone}
                      onChange={handleProfileChange}
                      maxLength={15}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      name="cpf"
                      value={profileData.cpf}
                      onChange={handleProfileChange}
                      maxLength={14}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                    <Input
                      id="dataNascimento"
                      name="dataNascimento"
                      type="date"
                      value={profileData.dataNascimento}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar Perfil'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4">
              <div>
                <Label>Raio de Visualização: {profileData.raioVisualizacao} km</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Define o raio em quilômetros para visualizar entregas disponíveis
                </p>
                <Slider
                  value={[profileData.raioVisualizacao]}
                  onValueChange={handleRadiusChange}
                  max={100}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
              <Button onClick={() => updateUserProfile({ raioVisualizacao: profileData.raioVisualizacao })}>
                Salvar Preferências
              </Button>
            </TabsContent>

            <TabsContent value="password" className="space-y-4">
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div>
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                <Button type="submit" disabled={passwordLoading}>
                  {passwordLoading ? 'Alterando...' : 'Alterar Senha'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserSettings;
