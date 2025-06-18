
import React, { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, MapPin, Trash2, Copy } from 'lucide-react';
import { ElementContextMenuProps } from '../types/map';

const ElementContextMenu: React.FC<ElementContextMenuProps> = ({
  x,
  y,
  element,
  onEdit,
  onDelete,
  onClone,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const getElementName = () => {
    if (element.type === 'marco') {
      return (element.data as any).name;
    } else if (element.type === 'present') {
      return (element.data as any).name;
    } else {
      return (element.data as any).name;
    }
  };

  return (
    <div
      ref={menuRef}
      className="absolute z-50 w-48"
      style={{
        left: x,
        top: y,
      }}
    >
      <Card className="shadow-lg border">
        <CardContent className="p-2">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground px-2 py-1 font-medium">
              {getElementName()}
            </p>
            <div className="border-t pt-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={() => onEdit('location')}
              >
                <MapPin className="w-4 h-4 mr-2" />
                Editar Localização
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={() => onEdit('info')}
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar Informações
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                onClick={onClone}
              >
                <Copy className="w-4 h-4 mr-2" />
                Clonar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={onDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ElementContextMenu;
