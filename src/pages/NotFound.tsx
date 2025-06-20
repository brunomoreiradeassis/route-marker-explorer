
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <MapPin className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Página não encontrada</CardTitle>
          <p className="text-gray-600">A página que você está procurando não existe.</p>
        </CardHeader>
        <CardContent>
          <Link to="/login">
            <Button className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Voltar ao Login
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
