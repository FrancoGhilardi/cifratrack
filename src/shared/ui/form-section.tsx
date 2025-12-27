'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './card';

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

/**
 * Sección de formulario reutilizable con Card + Header estandarizado.
 */
export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
