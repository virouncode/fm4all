import type { RoleEntrepriseType } from "@/zod-schemas/entreprise.schema";

export function getRoleBadgeStyles(role: RoleEntrepriseType): {
  className: string;
  label: string;
} {
  switch (role) {
    case "client":
      return {
        className: "bg-blue-100 text-blue-800 border-blue-200",
        label: "Client",
      };
    case "prestataire":
      return {
        className: "bg-green-100 text-green-800 border-green-200",
        label: "Prestataire",
      };
    case "plateforme":
      return {
        className: "bg-violet-100 text-violet-800 border-violet-200",
        label: "Plateforme",
      };
    default:
      return {
        className: "bg-gray-100 text-gray-800 border-gray-200",
        label: role,
      };
  }
}

export function formatEntrepriseDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
