"use client";

import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/*eslint-disable @typescript-eslint/no-explicit-any */

type SortableHeaderProps = {
  column: any; // tanstack column
  label: string;
  className?: string;
  pageParamName?: string; // ex: "page"
  cursorParamName?: string; // ex: "cursor" si tu fais cursor-based
};

export const SortableHeader = ({
  column,
  label,
  className,
  pageParamName = "page",
  cursorParamName = "cursor",
}: SortableHeaderProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentOrderBy = searchParams.get("orderBy");
  const currentOrderDir = searchParams.get("orderDir") as "asc" | "desc" | null;

  const isActive = currentOrderBy === column.id;

  // Icône selon l'état de tri
  let Icon = ArrowUpDown;
  if (isActive && currentOrderDir === "asc") Icon = ArrowUp;
  else if (isActive && currentOrderDir === "desc") Icon = ArrowDown;

  const handleClick = () => {
    const params = new URLSearchParams(searchParams.toString());

    // 🔁 Logique de cycle de tri
    if (!isActive) {
      // Pas encore trié sur cette colonne -> on commence en asc
      params.set("orderBy", column.id);
      params.set("orderDir", "asc");
    } else if (currentOrderDir === "asc") {
      // Déjà trié asc -> passe en desc
      params.set("orderDir", "desc");
    } else {
      // Déjà trié desc -> supprime le tri (retour à l'état "none")
      params.delete("orderBy");
      params.delete("orderDir");
    }

    // 🧭 Reset pagination :
    // - si tu es en mode page-based : page = 1
    // - si tu es en mode cursor-based : on supprime le cursor
    if (params.has(pageParamName)) {
      params.set(pageParamName, "1");
    }
    if (params.has(cursorParamName)) {
      params.delete(cursorParamName);
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <Button
      variant="ghost"
      onClick={handleClick}
      className={className ?? "px-0"}
    >
      {label}
      <Icon className="ml-2 h-4 w-4" />
    </Button>
  );
};
