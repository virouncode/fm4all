"use client";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useIntersection from "@/hooks/use-intersection";
import { cn } from "@/lib/utils";
import {
  flexRender,
  getCoreRowModel,
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

type InfiniteDataTableProps<T> = {
  columns: ColumnDef<T>[];
  items: T[];
  // état global
  isLoading: boolean;
  isError: boolean;
  // infinite scroll
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void> | void;
  // sorting
  sorting: SortingState;
  setSorting: Dispatch<SetStateAction<SortingState>>;
  // divers
  idLabelMap: Map<string, string>;
  total: number;
  onRowClick?: (row: T) => void;
  getRowId?: (row: T, index: number) => string;
};

const InfiniteDataTable = <T,>({
  columns,
  items,
  isLoading,
  isError,
  isLoadingMore,
  hasMore,
  loadMore,
  sorting,
  setSorting,
  idLabelMap,
  total,
  onRowClick,
  getRowId,
}: InfiniteDataTableProps<T>) => {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const { rootRef, targetRef } = useIntersection<HTMLDivElement>({
    isLoading: isLoadingMore,
    hasMore,
    onLoadMore: loadMore,
  });

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    state: {
      sorting,
      columnVisibility,
    },
    onSortingChange: (updater) => {
      setSorting((old) =>
        typeof updater === "function" ? updater(old) : updater,
      );
    },
    onColumnVisibilityChange: setColumnVisibility,
    ...(getRowId && { getRowId }),
  });

  const buildTableBody = () => {
    const visibleColumnCount =
      table.getVisibleLeafColumns().length || columns.length;

    if (isLoading && items.length === 0) {
      return <LoadingRow colSpan={visibleColumnCount} />;
    }
    if (isError) {
      return <ErrorRow colSpan={visibleColumnCount} />;
    }
    if (table.getRowModel().rows.length === 0) {
      return <EmptyRow colSpan={visibleColumnCount} />;
    }

    const rows = table.getRowModel().rows;

    return rows.map((row, index) => {
      const isLast = index === rows.length - 1;

      return (
        <TableRow
          key={row.id}
          // sentinel sur la dernière ligne visible
          ref={isLast ? targetRef : undefined}
        >
          {row.getVisibleCells().map((cell) => (
            <TableCell
              key={cell.id}
              onClick={onRowClick ? () => onRowClick(row.original) : undefined}
              className={cn(
                index % 2 === 0 ? "bg-muted" : "",
                onRowClick ? "hover:bg-muted/60 cursor-pointer" : "",
              )}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
      );
    });
  };

  return (
    <div className="flex h-full w-full max-w-full flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm italic">
          <span>Nombre de résultats :</span>{" "}
          {isLoading && items.length === 0 ? <Spinner /> : <span>{total}</span>}
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

      {/* TABLE SCROLLABLE */}
      <div
        className="relative flex-1 overflow-auto rounded-md border"
        ref={rootRef}
      >
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
          <TableBody>
            {buildTableBody()}
            {isLoadingMore && (
              <LoadingRow colSpan={table.getVisibleLeafColumns().length} />
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default InfiniteDataTable;
