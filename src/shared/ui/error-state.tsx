import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from './card';

interface ErrorStateProps {
  /**
   * Mensaje de error a mostrar
   */
  message: string;
  /**
   * Mostrar botón de recarga
   */
  showReloadButton?: boolean;
  /**
   * Clases CSS adicionales para el contenedor
   */
  className?: string;
}

/**
 * Componente reutilizable para mostrar estados de error
 */
export function ErrorState({ message, showReloadButton = false, className = '' }: ErrorStateProps) {
  return (
    <Card className={`bg-orange-50 dark:bg-orange-950/20 border-0 ${className}`}>
      <CardContent className="py-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
              {message}
            </p>
            {showReloadButton && (
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-xs text-orange-600 dark:text-orange-400 hover:underline"
              >
                Recargar página
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
