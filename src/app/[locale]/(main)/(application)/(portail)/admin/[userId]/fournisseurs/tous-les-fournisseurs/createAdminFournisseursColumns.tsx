import { getColumnLabel } from "@/components/tables/getColumnLabel";
import { SortableHeader } from "@/components/tables/SortableHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatInTimezone } from "@/lib/utils/formatDates";
import { SelectFournisseurType } from "@/zod-schemas/fournisseur";
import { CellContext, ColumnDef } from "@tanstack/react-table";
import { Building2 } from "lucide-react";

export const adminFournisseursIdLabelMap = new Map<string, string>([
  ["nomFournisseur", "Nom du fournisseur"],
  ["siret", "SIRET"],
  ["prenomContact", "Prénom contact"],
  ["nomContact", "Nom contact"],
  ["emailContact", "Email contact"],
  ["phoneContact", "Tél. contact"],
  ["createdAt", "Date de création"],
  ["updatedAt", "Dernière mise à jour"],
]);

// Composant personnalisé pour afficher nomFournisseur avec avatar
const FournisseurNameCell = ({
  row,
}: CellContext<SelectFournisseurType, unknown>) => {
  const fournisseur = row.original;

  // Initiales pour fallback
  const initials = fournisseur.nomFournisseur
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <Avatar className="bg-muted/60 h-9 w-9 rounded-full border">
        {fournisseur.logoUrl && (
          <AvatarImage
            src={fournisseur.logoUrl}
            alt={fournisseur.nomFournisseur}
            className="object-contain p-1"
          />
        )}
        <AvatarFallback className="bg-primary/5 text-primary rounded-full">
          <div className="flex h-full w-full items-center justify-center">
            {initials ? (
              <span className="text-xs font-semibold">{initials}</span>
            ) : (
              <Building2 className="h-4 w-4" />
            )}
          </div>
        </AvatarFallback>
      </Avatar>
      <span className="font-medium">{fournisseur.nomFournisseur}</span>
    </div>
  );
};

export const createAdminFournisseursColumns =
  (): ColumnDef<SelectFournisseurType>[] => [
    // {
    //   accessorKey: "id",
    //   header: ({ column }) => (
    //     <SortableHeader
    //       column={column}
    //       label={getColumnLabel("id", adminFournisseursIdLabelMap)}
    //     />
    //   ),
    //   accessorFn: (row) => row.id,
    // },
    {
      accessorKey: "nomFournisseur",
      header: ({ column }) => (
        <SortableHeader
          column={column}
          label={getColumnLabel("nomFournisseur", adminFournisseursIdLabelMap)}
        />
      ),
      accessorFn: (row) => row.nomFournisseur,
      cell: FournisseurNameCell,
    },
    {
      accessorKey: "siret",
      header: ({ column }) => (
        <SortableHeader
          column={column}
          label={getColumnLabel("siret", adminFournisseursIdLabelMap)}
        />
      ),
      accessorFn: (row) => row.siret,
    },
    {
      accessorKey: "prenomContact",
      header: ({ column }) => (
        <SortableHeader
          column={column}
          label={getColumnLabel("prenomContact", adminFournisseursIdLabelMap)}
        />
      ),
      accessorFn: (row) => row.prenomContact,
    },
    {
      accessorKey: "nomContact",
      header: ({ column }) => (
        <SortableHeader
          column={column}
          label={getColumnLabel("nomContact", adminFournisseursIdLabelMap)}
        />
      ),
      accessorFn: (row) => row.nomContact,
    },
    {
      accessorKey: "emailContact",
      header: ({ column }) => (
        <SortableHeader
          column={column}
          label={getColumnLabel("emailContact", adminFournisseursIdLabelMap)}
        />
      ),
      accessorFn: (row) => row.emailContact,
    },
    {
      accessorKey: "phoneContact",
      header: ({ column }) => (
        <SortableHeader
          column={column}
          label={getColumnLabel("phoneContact", adminFournisseursIdLabelMap)}
        />
      ),
      accessorFn: (row) => row.phoneContact,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <SortableHeader
          column={column}
          label={getColumnLabel("createdAt", adminFournisseursIdLabelMap)}
        />
      ),
      accessorFn: (row) => row.createdAt,
      cell: ({ getValue }) => {
        const value = getValue() as Date;
        return formatInTimezone(value);
      },
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <SortableHeader
          column={column}
          label={getColumnLabel("updatedAt", adminFournisseursIdLabelMap)}
        />
      ),
      accessorFn: (row) => row.updatedAt,
      cell: ({ getValue }) => {
        const value = getValue() as Date;
        return formatInTimezone(value);
      },
    },
  ];
