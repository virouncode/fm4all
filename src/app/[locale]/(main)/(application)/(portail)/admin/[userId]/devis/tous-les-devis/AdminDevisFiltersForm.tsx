"use client";

import { RhfControlledSelect } from "@/components/rhf/RhfControlledSelect";
import { RhfDatePicker } from "@/components/rhf/RhfDatePicker";
import { RhfInput } from "@/components/rhf/RhfInput";
import { Form } from "@/components/ui/form";
import { SelectItem } from "@/components/ui/select";
import { devisStatusCT, devisTypePrixCT } from "@/constants/codeTables";
import { useDebounce } from "@/hooks/use-debounce";
import { SelectClientType } from "@/zod-schemas/client";
import {
  AdminDevisQueryBackendType,
  AdminDevisQueryFiltersType,
} from "@/zod-schemas/devis";
import { SelectFournisseurType } from "@/zod-schemas/fournisseur";
import { SelectSiteType } from "@/zod-schemas/site";
import { DateTime } from "luxon";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";

type AdminDevisFiltersFormProps = {
  initialFilters: AdminDevisQueryBackendType;
  clients: SelectClientType[];
  sites: SelectSiteType[];
  allFournisseurs: SelectFournisseurType[];
};

const AdminDevisFiltersForm = ({
  initialFilters,
  clients,
  sites,
  allFournisseurs,
}: AdminDevisFiltersFormProps) => {
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Ref pour tracker le changement de client
  const previousClientId = useRef<string | undefined>(
    initialFilters.clientId ? String(initialFilters.clientId) : "all",
  );

  const defaultValues: AdminDevisQueryFiltersType = {
    clientId: initialFilters.clientId ? String(initialFilters.clientId) : "all",
    createdFrom: initialFilters.createdFrom
      ? initialFilters.createdFrom.toISOString().slice(0, 10)
      : "",
    createdTo: initialFilters.createdTo
      ? initialFilters.createdTo.toISOString().slice(0, 10)
      : "",
    validFrom: initialFilters.validFrom
      ? initialFilters.validFrom.toISOString().slice(0, 10)
      : "",
    validTo: initialFilters.validTo
      ? initialFilters.validTo.toISOString().slice(0, 10)
      : "",
    titre: initialFilters.titre ? initialFilters.titre : "",
    status: initialFilters.status ?? "all",
    typePrix: initialFilters.typePrix ?? "all",
    fournisseurId: initialFilters.fournisseurId
      ? initialFilters.fournisseurId.toString()
      : "all",
    siteId: initialFilters.siteId ? initialFilters.siteId.toString() : "all",
  };

  const form = useForm<AdminDevisQueryFiltersType>({
    defaultValues,
    mode: "onTouched",
  });

  const filters = useWatch({ control: form.control });
  const createdStart = useWatch({ control: form.control, name: "createdFrom" });
  const createdEnd = useWatch({ control: form.control, name: "createdTo" });
  const validStart = useWatch({ control: form.control, name: "validFrom" });
  const validEnd = useWatch({ control: form.control, name: "validTo" });
  const clientId = useWatch({ control: form.control, name: "clientId" });
  const debouncedTitre = useDebounce(filters.titre, 400);

  // Reset siteId quand le client change
  useEffect(() => {
    if (clientId !== previousClientId.current) {
      form.setValue("siteId", "all", {
        shouldDirty: true,
        shouldValidate: true,
      });
      previousClientId.current = clientId;
    }
  }, [clientId, form]);

  useEffect(() => {
    if (!createdStart || !createdEnd) return;

    const startDt = DateTime.fromISO(createdStart).startOf("day");
    const endDt = DateTime.fromISO(createdEnd).startOf("day");

    if (endDt <= startDt) {
      const newEnd = startDt.plus({ days: 1 }).startOf("day").toISODate() ?? "";
      form.setValue("createdTo", newEnd, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [createdStart, createdEnd, form]);

  useEffect(() => {
    if (!validStart || !validEnd) return;

    const startDt = DateTime.fromISO(validStart).startOf("day");
    const endDt = DateTime.fromISO(validEnd).startOf("day");

    if (endDt <= startDt) {
      const newEnd = startDt.plus({ days: 1 }).startOf("day").toISODate() ?? "";
      form.setValue("validTo", newEnd, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [validStart, validEnd, form]);

  const minCreatedTo = useMemo(() => {
    if (!createdStart) return undefined;
    return (
      DateTime.fromISO(createdStart)
        .plus({ days: 1 })
        .startOf("day")
        .toISODate() ?? undefined
    );
  }, [createdStart]);

  const minValidTo = useMemo(() => {
    if (!validStart) return undefined;
    return (
      DateTime.fromISO(validStart)
        .plus({ days: 1 })
        .startOf("day")
        .toISODate() ?? undefined
    );
  }, [validStart]);

  // Filtrer les sites en fonction du client sélectionné
  const filteredSites = useMemo(() => {
    if (!clientId || clientId === "all") return sites;
    const clientIdNum = Number(clientId);
    return sites.filter((s) => s.clientId === clientIdNum);
  }, [clientId, sites]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.clientId) {
      params.set("clientId", filters.clientId);
    }
    if (filters.createdFrom) {
      params.set("createdFrom", filters.createdFrom);
    }
    if (filters.createdTo) {
      params.set("createdTo", filters.createdTo);
    }
    if (filters.validFrom) {
      params.set("validFrom", filters.validFrom);
    }
    if (filters.validTo) {
      params.set("validTo", filters.validTo);
    }
    if (debouncedTitre) {
      params.set("titre", debouncedTitre);
    }
    if (filters.status) {
      params.set("status", filters.status);
    }
    if (filters.typePrix) {
      params.set("typePrix", filters.typePrix);
    }
    if (filters.fournisseurId) {
      params.set("fournisseurId", filters.fournisseurId);
    }
    if (filters.siteId) {
      params.set("siteId", filters.siteId);
    }

    // Préserver les paramètres de tri existants (orderBy, orderDir)
    const orderBy = searchParams.get("orderBy");
    const orderDir = searchParams.get("orderDir");
    if (orderBy) params.set("orderBy", orderBy);
    if (orderDir) params.set("orderDir", orderDir);

    const next = `${pathname}?${params.toString()}`;
    const current = `${pathname}?${searchParams.toString()}`;

    if (next !== current) {
      replace(next, { scroll: false });
    }
  }, [filters, pathname, replace, debouncedTitre, searchParams]);

  return (
    <Form {...form}>
      <form className="flex flex-wrap gap-4">
        <RhfControlledSelect<AdminDevisQueryFiltersType>
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

        <RhfDatePicker<AdminDevisQueryFiltersType>
          label="Crée du"
          name="createdFrom"
          buttonClassName="w-40"
          withError={false}
        />
        <RhfDatePicker<AdminDevisQueryFiltersType>
          label="Au"
          name="createdTo"
          min={minCreatedTo}
          buttonClassName="w-40"
          withError={false}
        />
        <RhfDatePicker<AdminDevisQueryFiltersType>
          label="Valide du"
          name="validFrom"
          buttonClassName="w-40"
          withError={false}
        />
        <RhfDatePicker<AdminDevisQueryFiltersType>
          label="Au"
          name="validTo"
          min={minValidTo}
          buttonClassName="w-40"
          withError={false}
        />
        <RhfControlledSelect<AdminDevisQueryFiltersType>
          label="Etat"
          name="status"
          selectClassName="w-40"
          withError={false}
        >
          <SelectItem value="all">Tous</SelectItem>
          {devisStatusCT
            .filter((s) => s.code !== "brouillon")
            .map((s) => (
              <SelectItem key={s.code} value={s.code}>
                {s.name}
              </SelectItem>
            ))}
        </RhfControlledSelect>
        <RhfControlledSelect<AdminDevisQueryFiltersType>
          label="Type"
          name="typePrix"
          selectClassName="w-40"
          withError={false}
        >
          <SelectItem value="all">Tous</SelectItem>
          {devisTypePrixCT.map((tp) => (
            <SelectItem key={tp.code} value={tp.code}>
              {tp.name}
            </SelectItem>
          ))}
        </RhfControlledSelect>
        <RhfControlledSelect<AdminDevisQueryFiltersType>
          label="Site"
          name="siteId"
          selectClassName="w-40"
          withError={false}
        >
          <SelectItem value="all">Tous</SelectItem>
          {filteredSites.map((s) => (
            <SelectItem key={s.id} value={s.id.toString()}>
              {s.nomSite}
            </SelectItem>
          ))}
        </RhfControlledSelect>
        <RhfControlledSelect<AdminDevisQueryFiltersType>
          label="Prestataire"
          name="fournisseurId"
          selectClassName="w-40"
          withError={false}
        >
          <SelectItem value="all">Tous</SelectItem>
          {allFournisseurs.map((f) => (
            <SelectItem key={f.id} value={f.id.toString()}>
              {f.nomFournisseur}
            </SelectItem>
          ))}
        </RhfControlledSelect>
        <RhfInput<AdminDevisQueryFiltersType>
          label="Titre"
          name="titre"
          inputClassName="w-60"
          withError={false}
        />
      </form>
    </Form>
  );
};

export default AdminDevisFiltersForm;
