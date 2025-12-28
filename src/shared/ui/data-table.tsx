'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';
import { Button } from './button';
import { EmptyState } from './empty-state';
import { Plus, LucideIcon } from 'lucide-react';

export interface DataTableColumn<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

export interface DataTableAction<T> {
  label: string;
  icon?: LucideIcon;
  onClick: (item: T) => void;
  variant?: 'default' | 'ghost' | 'outline' | 'destructive';
  disabled?: (item: T) => boolean;
}

interface DataTableProps<T> {
  title: string;
  description: string;
  data: T[];
  columns: DataTableColumn<T>[];
  actions?: DataTableAction<T>[];
  onCreate?: () => void;
  createButtonLabel?: string;
  showCreateButton?: boolean;
  emptyStateIcon: LucideIcon;
  emptyStateTitle: string;
  emptyStateDescription: string;
  getItemKey: (item: T) => string;
}

/**
 * Componente genérico para tablas de datos con CRUD
 */
export function DataTable<T>({
  title,
  description,
  data,
  columns,
  actions = [],
  onCreate,
  createButtonLabel = 'Crear nuevo',
  showCreateButton = false,
  emptyStateIcon,
  emptyStateTitle,
  emptyStateDescription,
  getItemKey,
}: DataTableProps<T>) {
  return (
    <Card className="border-0">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {showCreateButton && onCreate && (
          <Button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              onCreate();
            }}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            {createButtonLabel}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState
            icon={emptyStateIcon}
            title={emptyStateTitle}
            description={emptyStateDescription}
          />
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column, idx) => (
                    <TableHead key={idx} className={column.className}>
                      {column.header}
                    </TableHead>
                  ))}
                  {actions.length > 0 && (
                    <TableHead className="text-right">Acciones</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={getItemKey(item)}>
                    {columns.map((column, idx) => (
                      <TableCell key={idx} className={column.className}>
                        {column.cell
                          ? column.cell(item)
                          : column.accessorKey
                            ? String(item[column.accessorKey])
                            : null}
                      </TableCell>
                    ))}
                    {actions.length > 0 && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {actions.map((action, idx) => {
                            const Icon = action.icon;
                            const isDisabled = action.disabled?.(item) ?? false;
                            return (
                              <Button
                                key={idx}
                                variant={action.variant ?? 'ghost'}
                                size="sm"
                                onClick={() => action.onClick(item)}
                                disabled={isDisabled}
                                aria-label={action.label}
                              >
                                {Icon && <Icon className="h-4 w-4" />}
                              </Button>
                            );
                          })}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
