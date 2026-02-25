"use client";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";
import { useState, type Dispatch, type SetStateAction } from "react";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import EmptyRow from "./EmptyRow";
import ErrorRow from "./ErrorRow";
import LoadingRow from "./LoadingRow";
import { getColumnLabel } from "./getColumnLabel";

type DataTableProps<T> = {
  columns: ColumnDef<T>[];
  items?: T[];
  isLoading?: boolean; // ⬅️ optionnel
  isError?: boolean; // ⬅️ optionnel
  idLabelMap: Map<string, string>;
  onRowClick?: (row: T) => void;

  /**
   * Si true => tri client via TanStack
   * Si false (default) => tri entièrement géré par le serveur (URL/SSR)
   */
  enableClientSorting?: boolean;

  /**
   * Utilisés uniquement si enableClientSorting = true.
   * Tu peux les laisser undefined pour les tables SSR comme "mes-sites".
   */
  sorting?: SortingState;
  setSorting?: Dispatch<SetStateAction<SortingState>>;
};

const DataTable = <T,>({
  columns,
  items,
  isLoading = false,
  isError = false,
  idLabelMap,
  onRowClick,
  enableClientSorting = false,
  sorting,
  setSorting,
}: DataTableProps<T>) => {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const table = useReactTable({
    data: items || [],
    columns,
    getCoreRowModel: getCoreRowModel(),

    // 🧠 Tri client activé uniquement si enableClientSorting = true
    ...(enableClientSorting && {
      getSortedRowModel: getSortedRowModel(),
      manualSorting: false as const,
      state: {
        sorting: sorting ?? [],
        columnVisibility,
      },
      onSortingChange: (updater) => {
        if (!setSorting) return;
        setSorting((old) =>
          typeof updater === "function" ? updater(old) : updater,
        );
      },
    }),

    // 🧠 Mode SSR (tri géré par l'URL + serveur) :
    // on NE TOUCHE PAS AU TRI côté client.
    ...(!enableClientSorting && {
      manualSorting: true as const,
      state: {
        columnVisibility,
      },
    }),

    onColumnVisibilityChange: setColumnVisibility,
  });

  const buildTableBody = () => {
    const visibleColumnCount =
      table.getVisibleLeafColumns().length || columns.length;

    if (isLoading) {
      return <LoadingRow colSpan={visibleColumnCount} />;
    }
    if (isError) {
      return <ErrorRow colSpan={visibleColumnCount} />;
    }
    if (table.getRowModel().rows.length === 0) {
      return <EmptyRow colSpan={visibleColumnCount} />;
    }
    return table.getRowModel().rows.map((row, index) => (
      <TableRow
        key={row.id}
        tabIndex={onRowClick ? 0 : undefined}
        onClick={onRowClick ? () => onRowClick(row.original) : undefined}
        onKeyDown={
          onRowClick
            ? (e) => {
                if (e.key === "Enter") onRowClick(row.original);
              }
            : undefined
        }
        className={cn(onRowClick ? "cursor-pointer hover:bg-muted/60" : "")}
      >
        {row.getVisibleCells().map((cell) => (
          <TableCell
            key={cell.id}
            className={cn(index % 2 === 0 ? "bg-muted" : "")}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    ));
  };

  return (
    <div className="flex h-full w-full max-w-full flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm italic">
          <span>Nombre de résultats:</span>{" "}
          {isLoading ? <Spinner /> : <span>{items ? items.length : ""}</span>}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Colonnes <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                const label = getColumnLabel(column.id, idLabelMap);
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {label}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="relative flex-1 overflow-auto rounded-md border">
        <Table className="min-w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-background hover:bg-background sticky top-0 z-10"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>{buildTableBody()}</TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DataTable;
