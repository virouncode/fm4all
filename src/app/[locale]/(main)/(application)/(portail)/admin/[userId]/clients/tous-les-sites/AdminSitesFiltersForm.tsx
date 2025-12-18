"use client";

import { RhfControlledSelect } from "@/components/rhf/RhfControlledSelect";
import { RhfInput } from "@/components/rhf/RhfInput";
import { Form } from "@/components/ui/form";
import { SelectItem } from "@/components/ui/select";
import { typeBatimentCT, typeOccupationCT } from "@/constants/codeTables";
import { useDebounce } from "@/hooks/use-debounce";
import { SelectClientType } from "@/zod-schemas/client";
import {
  AdminSitesQueryBackendType,
  AdminSitesQueryFiltersType,
  SelectSiteType,
} from "@/zod-schemas/site";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";

type AdminSitesFiltersFormProps = {
  initialFilters: AdminSitesQueryBackendType;
  clients: SelectClientType[];
  allSites: SelectSiteType[];
};

const AdminSitesFiltersForm = ({
  initialFilters,
  clients,
  allSites,
}: AdminSitesFiltersFormProps) => {
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("DevisPage.locaux.locauxForm");

  // Ref pour tracker le changement de client
  const previousClientId = useRef<string | undefined>(
    initialFilters.clientId ? String(initialFilters.clientId) : "all",
  );

  const defaultValues: AdminSitesQueryFiltersType = {
    clientId: initialFilters.clientId ? String(initialFilters.clientId) : "all",
    nomSite: initialFilters.nomSite ?? "all",
    adresseLigne1: initialFilters.adresseLigne1 ?? "",
    codePostal: initialFilters.codePostal ?? "",
    ville: initialFilters.ville ?? "",
    typeBatiment: initialFilters.typeBatiment ?? "all",
    typeOccupation: initialFilters.typeOccupation ?? "all",
  };

  const form = useForm<AdminSitesQueryFiltersType>({
    defaultValues,
    mode: "onTouched",
  });

  const filters = useWatch({ control: form.control });
  const clientId = useWatch({ control: form.control, name: "clientId" });

  // Debounce pour les champs texte
  const debouncedAdresse = useDebounce(filters.adresseLigne1 ?? "", 500);
  const debouncedCodePostal = useDebounce(filters.codePostal ?? "", 500);
  const debouncedVille = useDebounce(filters.ville ?? "", 500);

  // Reset nomSite quand le client change
  useEffect(() => {
    if (clientId !== previousClientId.current) {
      form.setValue("nomSite", "all", {
        shouldDirty: true,
        shouldValidate: true,
      });
      previousClientId.current = clientId;
    }
  }, [clientId, form]);

  // Filtrer les sites en fonction du client sélectionné
  const filteredSites = useMemo(() => {
    if (!clientId || clientId === "all") return allSites;
    const clientIdNum = Number(clientId);
    return allSites.filter((s) => s.clientId === clientIdNum);
  }, [clientId, allSites]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.clientId && filters.clientId !== "all") {
      params.set("clientId", filters.clientId);
    }
    if (filters.nomSite && filters.nomSite !== "all") {
      params.set("nomSite", filters.nomSite);
    }
    if (debouncedAdresse && debouncedAdresse !== "") {
      params.set("adresseLigne1", debouncedAdresse);
    }
    if (debouncedCodePostal && debouncedCodePostal !== "") {
      params.set("codePostal", debouncedCodePostal);
    }
    if (debouncedVille && debouncedVille !== "") {
      params.set("ville", debouncedVille);
    }
    if (filters.typeBatiment && filters.typeBatiment !== "all") {
      params.set("typeBatiment", filters.typeBatiment);
    }
    if (filters.typeOccupation && filters.typeOccupation !== "all") {
      params.set("typeOccupation", filters.typeOccupation);
    }

    // Préserver les paramètres de tri existants
    const orderBy = searchParams.get("orderBy");
    const orderDir = searchParams.get("orderDir");
    if (orderBy) params.set("orderBy", orderBy);
    if (orderDir) params.set("orderDir", orderDir);

    const next = `${pathname}?${params.toString()}`;
    const current = `${pathname}?${searchParams.toString()}`;

    if (next !== current) {
      replace(next, { scroll: false });
    }
  }, [
    filters.clientId,
    filters.nomSite,
    debouncedAdresse,
    debouncedCodePostal,
    debouncedVille,
    filters.typeBatiment,
    filters.typeOccupation,
    pathname,
    replace,
    searchParams,
  ]);

  return (
    <Form {...form}>
      <form className="flex flex-wrap gap-4">
        <RhfControlledSelect<AdminSitesQueryFiltersType>
          label="Client"
          name="clientId"
          selectClassName="w-48"
          withError={false}
        >
          <SelectItem value="all">Tous les clients</SelectItem>
          {clients.map((c) => (
            <SelectItem key={c.id} value={String(c.id)}>
              {c.nomEntreprise}
            </SelectItem>
          ))}
        </RhfControlledSelect>

        <RhfControlledSelect<AdminSitesQueryFiltersType>
          label="Nom du site"
          name="nomSite"
          selectClassName="w-48"
          withError={false}
        >
          <SelectItem value="all">Tous les sites</SelectItem>
          {filteredSites.map((s) => (
            <SelectItem key={s.id} value={s.nomSite}>
              {s.nomSite}
            </SelectItem>
          ))}
        </RhfControlledSelect>

        <RhfInput<AdminSitesQueryFiltersType>
          name="adresseLigne1"
          label="Adresse"
          placeholder="Rechercher par adresse..."
          className="w-48"
        />

        <RhfInput<AdminSitesQueryFiltersType>
          name="codePostal"
          label="Code postal"
          placeholder="Rechercher..."
          className="w-32"
        />

        <RhfInput<AdminSitesQueryFiltersType>
          name="ville"
          label="Ville"
          placeholder="Rechercher..."
          className="w-40"
        />

        <RhfControlledSelect<AdminSitesQueryFiltersType>
          label="Type de bâtiment"
          name="typeBatiment"
          selectClassName="w-40"
          withError={false}
        >
          <SelectItem value="all">Tous</SelectItem>
          {typeBatimentCT.map((tb) => (
            <SelectItem key={tb.code} value={tb.code}>
              {t(tb.name)}
            </SelectItem>
          ))}
        </RhfControlledSelect>

        <RhfControlledSelect<AdminSitesQueryFiltersType>
          label="Type d'occupation"
          name="typeOccupation"
          selectClassName="w-40"
          withError={false}
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

export default AdminSitesFiltersForm;
