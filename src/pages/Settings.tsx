
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import UserSettings from '../components/UserSettings';

const Settings = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Mapa
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Configurações</h1>
          </div>
        </div>
      </div>
      <div className="py-8">
        <UserSettings />
      </div>
    </div>
  );
};

export default Settings;
