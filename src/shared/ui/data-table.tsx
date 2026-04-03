"use client";

import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { Button } from "./button";
import { EmptyState } from "./empty-state";
import { Plus, LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";

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
  variant?: "default" | "ghost" | "outline" | "destructive";
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

function getColumnContent<T>(column: DataTableColumn<T>, item: T): ReactNode {
  if (column.cell) {
    return column.cell(item);
  }

  if (column.accessorKey) {
    return String(item[column.accessorKey]);
  }

  return null;
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
  createButtonLabel = "Crear nuevo",
  showCreateButton = false,
  emptyStateIcon,
  emptyStateTitle,
  emptyStateDescription,
  getItemKey,
}: DataTableProps<T>) {
  return (
    <Card className="border-0">
      <CardHeader className="flex flex-col gap-4 space-y-0 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
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
            className="w-full sm:w-auto"
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
          <>
            <div className="space-y-3 md:hidden">
              {data.map((item) => (
                <Card key={getItemKey(item)} className="border shadow-none">
                  <CardContent className="space-y-4 p-4">
                    <div className="space-y-3">
                      {columns.map((column, idx) => {
                        const content = getColumnContent(column, item);
                        if (
                          content === null ||
                          content === undefined ||
                          content === ""
                        ) {
                          return null;
                        }

                        return (
                          <div
                            key={`${getItemKey(item)}-${column.header}-${idx}`}
                            className={cn(
                              "space-y-1",
                              idx === 0 && "border-b border-border pb-3",
                            )}
                          >
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              {column.header}
                            </p>
                            <div
                              className={cn(
                                "text-sm",
                                idx === 0 && "text-base font-semibold",
                              )}
                            >
                              {content}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {actions.length > 0 && (
                      <div className="flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:flex-wrap">
                        {actions.map((action, idx) => {
                          const Icon = action.icon;
                          const isDisabled = action.disabled?.(item) ?? false;
                          return (
                            <Button
                              key={idx}
                              variant={action.variant ?? "outline"}
                              size="sm"
                              className="justify-start"
                              onClick={() => action.onClick(item)}
                              disabled={isDisabled}
                              aria-label={action.label}
                            >
                              {Icon && <Icon className="h-4 w-4" />}
                              {action.label}
                            </Button>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="hidden rounded-lg border md:block">
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
                          {getColumnContent(column, item)}
                        </TableCell>
                      ))}
                      {actions.length > 0 && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {actions.map((action, idx) => {
                              const Icon = action.icon;
                              const isDisabled =
                                action.disabled?.(item) ?? false;
                              return (
                                <Button
                                  key={idx}
                                  variant={action.variant ?? "ghost"}
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
          </>
        )}
      </CardContent>
    </Card>
  );
}
