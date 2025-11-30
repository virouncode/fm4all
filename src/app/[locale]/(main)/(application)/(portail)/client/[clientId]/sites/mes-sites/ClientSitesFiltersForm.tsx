"use client";
import { RhfControlledSelect } from "@/components/rhf/RhfControlledSelect";
import { RhfInput } from "@/components/rhf/RhfInput";
import { Form } from "@/components/ui/form";
import { SelectItem } from "@/components/ui/select";
import { typeBatimentCT, typeOccupationCT } from "@/constants/codeTables";
import { useDebounce } from "@/hooks/use-debounce";
import {
  sitesQueryFiltersSchema,
  SitesQueryFiltersType,
} from "@/zod-schemas/site";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import qs from "query-string";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";

type ClientSitesFiltersFormProps = {
  clientId: number;
};

const ClientSitesFiltersForm = ({ clientId }: ClientSitesFiltersFormProps) => {
  const { replace } = useRouter();

  const defaultValues: SitesQueryFiltersType = {
    nomSite: "",
    codePostal: "",
    ville: "",
    typeBatiment: "all",
    typeOccupation: "all",
  };

  const form = useForm<SitesQueryFiltersType>({
    defaultValues,
    mode: "onTouched",
    resolver: zodResolver(sitesQueryFiltersSchema),
  });
  const filters = useWatch({ control: form.control });
  const debouncedNomSite = useDebounce(filters.nomSite, 300);
  const debouncedCodePostal = useDebounce(filters.codePostal, 300);
  const debouncedVille = useDebounce(filters.ville, 300);
  const effectiveFilters: SitesQueryFiltersType = {
    ...filters,
    nomSite: debouncedNomSite || "", // garde la même shape
    codePostal: debouncedCodePostal || "",
    ville: debouncedVille || "",
  };
  useEffect(() => {
    const newQuery: Partial<SitesQueryFiltersType> = {
      nomSite: debouncedNomSite || undefined,
      codePostal: debouncedCodePostal || undefined,
      ville: debouncedVille || undefined,
      typeBatiment: filters.typeBatiment,
      typeOccupation: filters.typeOccupation,
    };

    const url = qs.stringifyUrl(
      {
        url: `/client/${clientId}/sites/mes-sites`,
        query: Object.fromEntries(
          Object.entries(newQuery).filter(([_, v]) => v && v !== "all"),
        ),
      },
      { skipNull: true, skipEmptyString: true },
    );

    replace(url);
  }, [
    clientId,
    debouncedNomSite,
    debouncedCodePostal,
    debouncedVille,
    filters.typeBatiment,
    filters.typeOccupation,
    replace,
  ]);

  return (
    <Form {...form}>
      <form className="flex flex-wrap gap-4">
        <RhfInput<SitesQueryFiltersType>
          name="nomSite"
          label="Nom du site"
          placeholder="Rechercher par nom de site"
          className="w-40"
        />
        <RhfInput<SitesQueryFiltersType>
          name="codePostal"
          label="Code postal"
          placeholder="Rechercher par code postal"
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
              {tb.name}
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
              {to.name}
            </SelectItem>
          ))}
        </RhfControlledSelect>
      </form>
    </Form>
  );
};

export default ClientSitesFiltersForm;
