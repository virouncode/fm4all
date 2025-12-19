"use client";
import { RhfControlledSelect } from "@/components/rhf/RhfControlledSelect";
import { RhfInput } from "@/components/rhf/RhfInput";
import { Form } from "@/components/ui/form";
import { SelectItem } from "@/components/ui/select";
import { typeBatimentCT, typeOccupationCT } from "@/constants/codeTables";
import { useDebounce } from "@/hooks/use-debounce";
import {
  SitesQueryBackendType,
  SitesQueryFiltersType,
} from "@/zod-schemas/site";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";

type ClientSitesFiltersFormProps = {
  initialFilters: SitesQueryBackendType;
};

const ClientSitesFiltersForm = ({
  initialFilters,
}: ClientSitesFiltersFormProps) => {
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("DevisPage.locaux.locauxForm");

  const defaultValues: SitesQueryFiltersType = {
    ...initialFilters,
    nomSite: initialFilters.nomSite ?? "",
    codePostal: initialFilters.codePostal ?? "",
    ville: initialFilters.ville ?? "",
    typeBatiment: initialFilters.typeBatiment ?? "all",
    typeOccupation: initialFilters.typeOccupation ?? "all",
  };

  const form = useForm<SitesQueryFiltersType>({
    defaultValues,
    mode: "onChange",
  });

  // 1) on observe TOUT le form
  const filters = useWatch({ control: form.control });

  /**
   * 2) On extrait ce qui doit être debounced (inputs texte)
   */
  const textFilters = {
    nomSite: filters.nomSite,
    codePostal: filters.codePostal,
    ville: filters.ville,
  };

  // 3) On debounce UNIQUEMENT les champs texte
  const debouncedTextFilters = useDebounce(textFilters, 400);

  useEffect(() => {
    // 1) On reconstruit l'URL cible à partir des filtres
    const params = new URLSearchParams();

    if (debouncedTextFilters.nomSite) {
      params.set("nomSite", debouncedTextFilters.nomSite);
    }
    if (debouncedTextFilters.codePostal) {
      params.set("codePostal", debouncedTextFilters.codePostal);
    }
    if (debouncedTextFilters.ville) {
      params.set("ville", debouncedTextFilters.ville);
    }
    if (filters.typeBatiment) {
      params.set("typeBatiment", filters.typeBatiment);
    }
    if (filters.typeOccupation) {
      params.set("typeOccupation", filters.typeOccupation);
    }

    const next = `${pathname}?${params.toString()}`;
    const current = `${pathname}?${searchParams.toString()}`;

    // 2) Très important : NE NAVIGUER QUE SI ÇA CHANGE
    if (next !== current) {
      replace(next, { scroll: false });
    }
  }, [
    debouncedTextFilters.nomSite,
    debouncedTextFilters.codePostal,
    debouncedTextFilters.ville,
    filters.typeBatiment,
    filters.typeOccupation,
    pathname,
    replace,
  ]);

  return (
    <Form {...form}>
      <form className="flex flex-wrap gap-4">
        <RhfInput<SitesQueryFiltersType>
          name="nomSite"
          label="Nom du site"
          className="w-40"
        />
        <RhfInput<SitesQueryFiltersType>
          name="codePostal"
          label="Code postal"
          placeholder="XXXXX"
          className="w-40"
        />
        <RhfInput<SitesQueryFiltersType>
          name="ville"
          label="Ville"
          placeholder="Rechercher par ville"
          className="w-40"
        />
        <RhfControlledSelect<SitesQueryFiltersType>
          name="typeBatiment"
          label="Type de bâtiment"
          selectClassName="w-40"
        >
          <SelectItem value="all">Tous</SelectItem>
          {typeBatimentCT.map((tb) => (
            <SelectItem key={tb.code} value={tb.code}>
              {t(tb.name)}
            </SelectItem>
          ))}
        </RhfControlledSelect>
        <RhfControlledSelect<SitesQueryFiltersType>
          name="typeOccupation"
          label="Type d'occupation"
          selectClassName="w-40"
        >
          <SelectItem value="all">Tous</SelectItem>
          {typeOccupationCT.map((to) => (
            <SelectItem key={to.code} value={to.code}>
              {t(to.name)}
            </SelectItem>
          ))}
        </RhfControlledSelect>
      </form>
    </Form>
  );
};

export default ClientSitesFiltersForm;
