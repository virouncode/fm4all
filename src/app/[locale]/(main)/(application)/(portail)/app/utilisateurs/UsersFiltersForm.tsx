"use client";

import { RhfControlledSelect } from "@/components/rhf/RhfControlledSelect";
import { RhfInput } from "@/components/rhf/RhfInput";
import { Button } from "@/components/ui/button";
import { DialogStyledBody } from "@/components/ui/dialog-styled";
import { Form } from "@/components/ui/form";
import { SelectItem } from "@/components/ui/select";
import {
  adhesionStatutCT,
  roleClientAdhesionCT,
  rolePlateformeAdhesionCT,
  rolePrestataireAdhesionCT,
} from "@/constants/codeTables";
import { useDebounce } from "@/hooks/use-debounce";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useAppStore } from "@/stores/application/appStore";
import {
  usersQueryFrontendSchema,
  type UsersQueryFrontendType,
} from "@/zod-schemas/user.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { RotateCcw } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";

export function UsersFiltersForm() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const postureActive = useAppStore((state) => state.postureActive);

  // En posture plateforme le backend ignore roleAdhesion — cacher ce filtre
  const showRoleFilter = postureActive !== "plateforme";

  const roleCT =
    postureActive === "prestataire"
      ? rolePrestataireAdhesionCT
      : postureActive === "plateforme"
        ? rolePlateformeAdhesionCT
        : roleClientAdhesionCT;

  // Initialize form from URL
  const form = useForm<UsersQueryFrontendType>({
    resolver: zodResolver(usersQueryFrontendSchema),
    defaultValues: {
      search: searchParams.get("search") || "",
      roleAdhesion:
        (searchParams.get("roleAdhesion") as
          | (typeof roleClientAdhesionCT)[number]["code"]
          | "all"
          | undefined) || "all",
      statutAdhesion:
        (searchParams.get("statutAdhesion") as
          | (typeof adhesionStatutCT)[number]["code"]
          | "all"
          | undefined) || "all",
    },
  });

  const filters = useWatch({ control: form.control });
  const debouncedSearch = useDebounce(filters.search, 500);

  // Sync to URL
  useEffect(() => {
    const query: Record<string, string> = {};

    if (debouncedSearch) {
      query.search = debouncedSearch;
    }

    if (filters.roleAdhesion && filters.roleAdhesion !== "all") {
      query.roleAdhesion = filters.roleAdhesion;
    }

    if (filters.statutAdhesion && filters.statutAdhesion !== "all") {
      query.statutAdhesion = filters.statutAdhesion;
    }

    router.replace(
      {
        pathname: "/app/utilisateurs",
        query,
      },
      { scroll: false },
    );
  }, [
    debouncedSearch,
    filters.roleAdhesion,
    filters.statutAdhesion,
    pathname,
    router,
  ]);

  // Reset filters
  const handleReset = () => {
    form.reset({
      search: "",
      roleAdhesion: "all",
      statutAdhesion: "all",
    });
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.roleAdhesion && filters.roleAdhesion !== "all") count++;
    if (filters.statutAdhesion && filters.statutAdhesion !== "all") count++;
    return count;
  }, [filters]);

  return (
    <DialogStyledBody>
      <div className="space-y-6">
        <Form {...form}>
          <form
            className={`grid gap-4 ${showRoleFilter ? "grid-cols-3" : "grid-cols-2"}`}
          >
            <RhfInput
              label="Recherche"
              name="search"
              placeholder="Nom, prénom, email..."
              className="col-span-1"
              withError={false}
            />

            {showRoleFilter && (
              <RhfControlledSelect
                label="Rôle"
                name="roleAdhesion"
                className="col-span-1"
                selectClassName="w-full"
                withError={false}
              >
                <SelectItem value="all">Tous</SelectItem>
                {roleCT.map((r) => (
                  <SelectItem key={r.code} value={r.code}>
                    {r.name}
                  </SelectItem>
                ))}
              </RhfControlledSelect>
            )}

            <RhfControlledSelect
              label="Statut"
              name="statutAdhesion"
              className="col-span-1"
              selectClassName="w-full"
              withError={false}
            >
              <SelectItem value="all">Tous</SelectItem>
              {adhesionStatutCT.map((s) => (
                <SelectItem key={s.code} value={s.code}>
                  {s.name}
                </SelectItem>
              ))}
            </RhfControlledSelect>
          </form>
        </Form>
        <div className="flex items-center justify-end">
          <Button
            type="button"
            onClick={handleReset}
            disabled={activeFiltersCount === 0}
          >
            <RotateCcw />
            Réinitialiser ({activeFiltersCount})
          </Button>
        </div>
      </div>
    </DialogStyledBody>
  );
}
