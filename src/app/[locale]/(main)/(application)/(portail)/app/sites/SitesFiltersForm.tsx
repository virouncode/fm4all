"use client";

import { RhfControlledSelect } from "@/components/rhf/RhfControlledSelect";
import { RhfInput } from "@/components/rhf/RhfInput";
import { Button } from "@/components/ui/button";
import { DialogStyledBody } from "@/components/ui/dialog-styled";
import { Form } from "@/components/ui/form";
import { SelectItem } from "@/components/ui/select";
import { typeBatimentCT, typeOccupationCT } from "@/constants/codeTables";
import { useDebounce } from "@/hooks/use-debounce";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  sitesQueryFrontendSchema,
  type SitesQueryFrontendType,
} from "@/zod-schemas/sites.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";

export function SitesFiltersForm() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("DevisPage.locaux.locauxForm");

  // Initialize form from URL
  const form = useForm<SitesQueryFrontendType>({
    resolver: zodResolver(sitesQueryFrontendSchema),
    defaultValues: {
      nom: searchParams.get("nom") || "",
      ville: searchParams.get("ville") || "",
      typeBatiment: searchParams.get("typeBatiment") || "all",
      typeOccupation: searchParams.get("typeOccupation") || "all",
      surfaceMin: searchParams.get("surfaceMin") || "",
      surfaceMax: searchParams.get("surfaceMax") || "",
      effectifMin: searchParams.get("effectifMin") || "",
      effectifMax: searchParams.get("effectifMax") || "",
    },
  });

  const filters = useWatch({ control: form.control });

  // Debounce text / number inputs
  const debouncedNom = useDebounce(filters.nom, 500);
  const debouncedVille = useDebounce(filters.ville, 500);
  const debouncedSurfaceMin = useDebounce(filters.surfaceMin, 500);
  const debouncedSurfaceMax = useDebounce(filters.surfaceMax, 500);
  const debouncedEffectifMin = useDebounce(filters.effectifMin, 500);
  const debouncedEffectifMax = useDebounce(filters.effectifMax, 500);

  // Sync to URL
  useEffect(() => {
    const query: Record<string, string> = {};

    if (debouncedNom) query.nom = debouncedNom;
    if (debouncedVille) query.ville = debouncedVille;
    if (filters.typeBatiment && filters.typeBatiment !== "all")
      query.typeBatiment = filters.typeBatiment;
    if (filters.typeOccupation && filters.typeOccupation !== "all")
      query.typeOccupation = filters.typeOccupation;
    if (debouncedSurfaceMin) query.surfaceMin = debouncedSurfaceMin;
    if (debouncedSurfaceMax) query.surfaceMax = debouncedSurfaceMax;
    if (debouncedEffectifMin) query.effectifMin = debouncedEffectifMin;
    if (debouncedEffectifMax) query.effectifMax = debouncedEffectifMax;

    router.replace(
      { pathname: pathname as "/app/sites", query },
      { scroll: false },
    );
  }, [
    debouncedNom,
    debouncedVille,
    filters.typeBatiment,
    filters.typeOccupation,
    debouncedSurfaceMin,
    debouncedSurfaceMax,
    debouncedEffectifMin,
    debouncedEffectifMax,
    pathname,
    router,
  ]);

  // Reset filters
  const handleReset = () => {
    form.reset({
      nom: "",
      ville: "",
      typeBatiment: "all",
      typeOccupation: "all",
      surfaceMin: "",
      surfaceMax: "",
      effectifMin: "",
      effectifMax: "",
    });
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.nom) count++;
    if (filters.ville) count++;
    if (filters.typeBatiment && filters.typeBatiment !== "all") count++;
    if (filters.typeOccupation && filters.typeOccupation !== "all") count++;
    if (filters.surfaceMin) count++;
    if (filters.surfaceMax) count++;
    if (filters.effectifMin) count++;
    if (filters.effectifMax) count++;
    return count;
  }, [filters]);

  return (
    <DialogStyledBody>
      <div className="space-y-6">
        <Form {...form}>
          <form className="grid grid-cols-3 gap-4">
            <RhfInput
              label="Nom"
              name="nom"
              placeholder="Nom du site..."
              className="col-span-1"
              withError={false}
            />

            <RhfInput
              label="Ville"
              name="ville"
              placeholder="Ville..."
              className="col-span-1"
              withError={false}
            />

            <RhfControlledSelect
              label="Type de bâtiment"
              name="typeBatiment"
              className="col-span-1"
              selectClassName="w-full"
              withError={false}
            >
              <SelectItem value="all">Tous</SelectItem>
              {typeBatimentCT.map((type) => (
                <SelectItem key={type.code} value={type.code}>
                  {t(type.name)}
                </SelectItem>
              ))}
            </RhfControlledSelect>

            <RhfControlledSelect
              label="Type d'occupation"
              name="typeOccupation"
              className="col-span-1"
              selectClassName="w-full"
              withError={false}
            >
              <SelectItem value="all">Tous</SelectItem>
              {typeOccupationCT.map((type) => (
                <SelectItem key={type.code} value={type.code}>
                  {t(type.name)}
                </SelectItem>
              ))}
            </RhfControlledSelect>

            <RhfInput
              label="Surface min (m²)"
              name="surfaceMin"
              placeholder="1"
              className="col-span-1"
              withError={false}
            />

            <RhfInput
              label="Surface max (m²)"
              name="surfaceMax"
              placeholder="3000"
              className="col-span-1"
              withError={false}
            />

            <RhfInput
              label="Effectif min"
              name="effectifMin"
              placeholder="1"
              className="col-span-1"
              withError={false}
            />

            <RhfInput
              label="Effectif max"
              name="effectifMax"
              placeholder="300"
              className="col-span-1"
              withError={false}
            />
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
