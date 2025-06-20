
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { MapPin } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nomeCompleto: '',
    cpf: '',
    telefone: '',
    dataNascimento: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

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

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setFormData(prev => ({ ...prev, cpf: formatted }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData(prev => ({ ...prev, telefone: formatted }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword || 
        !formData.nomeCompleto || !formData.cpf || !formData.telefone || !formData.dataNascimento) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos",
        variant: "destructive"
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive"
      });
      return false;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      });
      return false;
    }

    if (formData.cpf.replace(/\D/g, '').length !== 11) {
      toast({
        title: "Erro",
        description: "CPF deve ter 11 dígitos",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await register({
        email: formData.email,
        password: formData.password,
        nomeCompleto: formData.nomeCompleto,
        cpf: formData.cpf,
        telefone: formData.telefone,
        dataNascimento: formData.dataNascimento
      });
      navigate('/');
      toast({
        title: "Sucesso",
        description: "Conta criada com sucesso!"
      });
    } catch (error: any) {
      toast({
        title: "Erro no cadastro",
        description: error.message || "Erro ao criar conta",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <MapPin className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Mapa Interativo</CardTitle>
          <p className="text-gray-600">Crie sua conta</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                name="nomeCompleto"
                type="text"
                placeholder="Nome Completo"
                value={formData.nomeCompleto}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Input
                name="cpf"
                type="text"
                placeholder="CPF"
                value={formData.cpf}
                onChange={handleCPFChange}
                maxLength={14}
                required
              />
            </div>
            <div>
              <Input
                name="telefone"
                type="text"
                placeholder="Telefone"
                value={formData.telefone}
                onChange={handlePhoneChange}
                maxLength={15}
                required
              />
            </div>
            <div>
              <Input
                name="dataNascimento"
                type="date"
                placeholder="Data de Nascimento"
                value={formData.dataNascimento}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Input
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Input
                name="password"
                type="password"
                placeholder="Senha"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Input
                name="confirmPassword"
                type="password"
                placeholder="Confirmar Senha"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? 'Criando conta...' : 'Criar conta'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-blue-600 hover:underline">
                Entre aqui
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
