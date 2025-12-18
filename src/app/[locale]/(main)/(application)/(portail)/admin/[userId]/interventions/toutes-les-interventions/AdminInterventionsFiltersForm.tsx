"use client";

import { RhfControlledSelect } from "@/components/rhf/RhfControlledSelect";
import { RhfDatePicker } from "@/components/rhf/RhfDatePicker";
import { Form } from "@/components/ui/form";
import { SelectItem } from "@/components/ui/select";
import {
  interventionStatusCT,
  interventionTypeCT,
} from "@/constants/codeTables";
import { SelectClientType } from "@/zod-schemas/client";
import { SelectFournisseurType } from "@/zod-schemas/fournisseur";
import {
  AdminInterventionsQueryBackendType,
  AdminInterventionsQueryFiltersType,
} from "@/zod-schemas/intervention";
import { SelectSiteType } from "@/zod-schemas/site";
import { DateTime } from "luxon";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";

type AdminInterventionsFiltersFormProps = {
  initialFilters: AdminInterventionsQueryBackendType;
  clients: SelectClientType[];
  sites: SelectSiteType[];
  fournisseursParClient: Record<number, SelectFournisseurType[]>;
  allFournisseurs: SelectFournisseurType[];
};

const AdminInterventionsFiltersForm = ({
  initialFilters,
  clients,
  sites,
  fournisseursParClient,
  allFournisseurs,
}: AdminInterventionsFiltersFormProps) => {
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Ref pour tracker le changement de client
  const previousClientId = useRef<string | undefined>(
    initialFilters.clientId ? String(initialFilters.clientId) : "all",
  );

  const defaultValues: AdminInterventionsQueryFiltersType = {
    // client
    clientId: initialFilters.clientId ? String(initialFilters.clientId) : "all",

    // dates → string (yyyy-mm-dd) ou ""
    dateDebutPrevueFrom: initialFilters.dateDebutPrevueFrom
      ? initialFilters.dateDebutPrevueFrom.toISOString().slice(0, 10)
      : "",
    dateDebutPrevueTo: initialFilters.dateDebutPrevueTo
      ? initialFilters.dateDebutPrevueTo.toISOString().slice(0, 10)
      : "",

    // enums → valeur ou "all"
    type: initialFilters.type ?? "all",
    status: initialFilters.status ?? "all",

    // ids → string ou "all"
    fournisseurId: initialFilters.fournisseurId
      ? String(initialFilters.fournisseurId)
      : "all",
    siteId: initialFilters.siteId ? String(initialFilters.siteId) : "all",
  };

  const form = useForm<AdminInterventionsQueryFiltersType>({
    defaultValues,
    mode: "onTouched",
  });

  const filters = useWatch({ control: form.control });
  const start = useWatch({
    control: form.control,
    name: "dateDebutPrevueFrom",
  });
  const end = useWatch({
    control: form.control,
    name: "dateDebutPrevueTo",
  });
  const clientId = useWatch({ control: form.control, name: "clientId" });

  // Reset fournisseurId et siteId quand le client change
  useEffect(() => {
    if (clientId !== previousClientId.current) {
      form.setValue("fournisseurId", "all", {
        shouldDirty: true,
        shouldValidate: true,
      });
      form.setValue("siteId", "all", {
        shouldDirty: true,
        shouldValidate: true,
      });
      previousClientId.current = clientId;
    }
  }, [clientId, form]);

  useEffect(() => {
    if (!start || !end) return;

    const startDt = DateTime.fromISO(start).startOf("day");
    const endDt = DateTime.fromISO(end).startOf("day");

    if (endDt <= startDt) {
      const newEnd = startDt.plus({ days: 1 }).startOf("day").toISODate() ?? "";
      form.setValue("dateDebutPrevueTo", newEnd, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [start, end, form]);

  const minTo = useMemo(() => {
    if (!start) return undefined;
    return (
      DateTime.fromISO(start).plus({ days: 1 }).startOf("day").toISODate() ??
      undefined
    );
  }, [start]);

  // Filtrer les sites en fonction du client sélectionné
  const filteredSites = useMemo(() => {
    if (!clientId || clientId === "all") return sites;
    const clientIdNum = Number(clientId);
    return sites.filter((s) => s.clientId === clientIdNum);
  }, [clientId, sites]);

  // Toujours afficher tous les fournisseurs (pas de contrainte par client)
  const filteredFournisseurs = allFournisseurs;

  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.clientId) {
      params.set("clientId", filters.clientId);
    }
    if (filters.dateDebutPrevueFrom) {
      params.set("dateDebutPrevueFrom", filters.dateDebutPrevueFrom);
    }
    if (filters.dateDebutPrevueTo) {
      params.set("dateDebutPrevueTo", filters.dateDebutPrevueTo);
    }
    if (filters.type) {
      params.set("type", filters.type);
    }
    if (filters.status) {
      params.set("status", filters.status);
    }
    if (filters.fournisseurId) {
      params.set("fournisseurId", String(filters.fournisseurId));
    }
    if (filters.siteId) {
      params.set("siteId", String(filters.siteId));
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
  }, [filters, pathname, replace, searchParams]);

  return (
    <Form {...form}>
      <form className="flex flex-wrap gap-4">
        <RhfControlledSelect<AdminInterventionsQueryFiltersType>
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

        <RhfDatePicker<AdminInterventionsQueryFiltersType>
          label="Date programmée du"
          name="dateDebutPrevueFrom"
          buttonClassName="w-40"
          withError={false}
        />
        <RhfDatePicker<AdminInterventionsQueryFiltersType>
          label="Au"
          name="dateDebutPrevueTo"
          min={minTo}
          buttonClassName="w-40"
          withError={false}
        />

        <RhfControlledSelect<AdminInterventionsQueryFiltersType>
          label="Type d'intervention"
          name="type"
          selectClassName="w-40"
          withError={false}
        >
          <SelectItem value="all">Tous</SelectItem>
          {interventionTypeCT.map((t) => (
            <SelectItem key={t.code} value={t.code}>
              {t.name}
            </SelectItem>
          ))}
        </RhfControlledSelect>

        <RhfControlledSelect<AdminInterventionsQueryFiltersType>
          label="Etat"
          name="status"
          selectClassName="w-56"
          withError={false}
        >
          <SelectItem value="all">Tous</SelectItem>
          {interventionStatusCT.map((s) => (
            <SelectItem key={s.code} value={s.code}>
              {s.name}
            </SelectItem>
          ))}
        </RhfControlledSelect>

        <RhfControlledSelect<AdminInterventionsQueryFiltersType>
          label="Site"
          name="siteId"
          selectClassName="w-40"
          withError={false}
        >
          <SelectItem value="all">Tous</SelectItem>
          {filteredSites.map((s) => (
            <SelectItem key={s.id} value={String(s.id)}>
              {s.nomSite}
            </SelectItem>
          ))}
        </RhfControlledSelect>

        <RhfControlledSelect<AdminInterventionsQueryFiltersType>
          label="Prestataire"
          name="fournisseurId"
          selectClassName="w-40"
          withError={false}
        >
          <SelectItem value="all">Tous</SelectItem>
          {filteredFournisseurs.map((f) => (
            <SelectItem key={f.id} value={String(f.id)}>
              {f.nomFournisseur}
            </SelectItem>
          ))}
        </RhfControlledSelect>
      </form>
    </Form>
  );
};

export default AdminInterventionsFiltersForm;
