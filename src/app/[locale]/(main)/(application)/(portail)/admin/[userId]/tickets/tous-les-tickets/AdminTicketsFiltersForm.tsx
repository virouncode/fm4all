"use client";

import { RhfControlledSelect } from "@/components/rhf/RhfControlledSelect";
import { RhfDatePicker } from "@/components/rhf/RhfDatePicker";
import { Form } from "@/components/ui/form";
import { SelectItem } from "@/components/ui/select";
import {
  ticketCategorieCT,
  ticketPrioriteCT,
  ticketStatusCT,
  ticketTypeCT,
} from "@/constants/codeTables";
import { SelectClientType } from "@/zod-schemas/client";
import { SelectFournisseurType } from "@/zod-schemas/fournisseur";
import { SelectSiteType } from "@/zod-schemas/site";
import {
  AdminTicketsQueryBackendType,
  AdminTicketsQueryFiltersType,
} from "@/zod-schemas/ticket";
import { DateTime } from "luxon";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";

type AdminTicketsFiltersFormProps = {
  initialFilters: AdminTicketsQueryBackendType;
  clients: SelectClientType[];
  sites: SelectSiteType[];
  fournisseursParClient: Record<number, SelectFournisseurType[]>;
  allFournisseurs: SelectFournisseurType[];
  isDevisTickets?: boolean;
};

const AdminTicketsFiltersForm = ({
  initialFilters,
  clients,
  sites,
  fournisseursParClient,
  allFournisseurs,
  isDevisTickets = false,
}: AdminTicketsFiltersFormProps) => {
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Ref pour tracker le changement de client
  const previousClientId = useRef<string | undefined>(
    initialFilters.clientId ? String(initialFilters.clientId) : "all",
  );

  const defaultValues: AdminTicketsQueryFiltersType = {
    // client
    clientId: initialFilters.clientId ? String(initialFilters.clientId) : "all",

    // dates → string (yyyy-mm-dd) ou ""
    createdFrom: initialFilters.createdFrom
      ? initialFilters.createdFrom.toISOString().slice(0, 10)
      : "",
    createdTo: initialFilters.createdTo
      ? initialFilters.createdTo.toISOString().slice(0, 10)
      : "",

    // enums → valeur ou "all"
    categorie: initialFilters.categorie ?? "all",
    priorite: initialFilters.priorite ?? "all",
    status: initialFilters.status ?? "all",
    type: isDevisTickets ? "demande_devis" : (initialFilters.type ?? "all"),

    // ids → string ou ""
    fournisseurId: initialFilters.fournisseurId
      ? String(initialFilters.fournisseurId)
      : "all",
    siteId: initialFilters.siteId ? String(initialFilters.siteId) : "all",
  };

  const form = useForm<AdminTicketsQueryFiltersType>({
    defaultValues,
    mode: "onTouched",
  });

  const filters = useWatch({ control: form.control });
  const start = useWatch({ control: form.control, name: "createdFrom" });
  const end = useWatch({ control: form.control, name: "createdTo" });
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
      form.setValue("createdTo", newEnd, {
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
  // Si client = "all", afficher tous les sites
  const filteredSites = useMemo(() => {
    if (!clientId || clientId === "all") return sites;
    const clientIdNum = Number(clientId);
    return sites.filter((s) => s.clientId === clientIdNum);
  }, [clientId, sites]);

  // Filtrer les fournisseurs en fonction du client sélectionné
  // Si client = "all", afficher tous les fournisseurs
  const filteredFournisseurs = useMemo(() => {
    if (!clientId || clientId === "all") return allFournisseurs;
    const clientIdNum = Number(clientId);
    return fournisseursParClient[clientIdNum] ?? [];
  }, [clientId, fournisseursParClient, allFournisseurs]);

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
    if (filters.categorie) {
      params.set("categorie", filters.categorie);
    }
    if (filters.priorite) {
      params.set("priorite", filters.priorite);
    }
    if (filters.status) {
      params.set("status", filters.status);
    }
    if (filters.type) {
      params.set("type", filters.type);
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
        <RhfControlledSelect<AdminTicketsQueryFiltersType>
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

        <RhfDatePicker<AdminTicketsQueryFiltersType>
          label="Du"
          name="createdFrom"
          buttonClassName="w-40"
          withError={false}
        />
        <RhfDatePicker<AdminTicketsQueryFiltersType>
          label="Au"
          name="createdTo"
          min={minTo}
          buttonClassName="w-40"
          withError={false}
        />

        <RhfControlledSelect<AdminTicketsQueryFiltersType>
          label="Catégorie"
          name="categorie"
          selectClassName="w-40"
          withError={false}
        >
          <SelectItem value="all">Toutes</SelectItem>
          {ticketCategorieCT.map((c) => (
            <SelectItem key={c.code} value={c.code}>
              {c.name}
            </SelectItem>
          ))}
        </RhfControlledSelect>

        <RhfControlledSelect<AdminTicketsQueryFiltersType>
          label="Priorité"
          name="priorite"
          selectClassName="w-40"
          withError={false}
        >
          <SelectItem value="all">Toutes</SelectItem>
          {ticketPrioriteCT.map((p) => (
            <SelectItem key={p.code} value={p.code}>
              {p.name}
            </SelectItem>
          ))}
        </RhfControlledSelect>

        <RhfControlledSelect<AdminTicketsQueryFiltersType>
          label="Etat"
          name="status"
          selectClassName="w-40"
          withError={false}
        >
          <SelectItem value="all">Tous</SelectItem>
          {ticketStatusCT.map((s) => (
            <SelectItem key={s.code} value={s.code}>
              {s.name}
            </SelectItem>
          ))}
        </RhfControlledSelect>

        {!isDevisTickets && (
          <RhfControlledSelect<AdminTicketsQueryFiltersType>
            label="Type"
            name="type"
            selectClassName="w-52"
            withError={false}
          >
            <SelectItem value="all">Tous</SelectItem>
            {ticketTypeCT.map((t) => (
              <SelectItem key={t.code} value={t.code}>
                {t.name}
              </SelectItem>
            ))}
          </RhfControlledSelect>
        )}

        <RhfControlledSelect<AdminTicketsQueryFiltersType>
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

        <RhfControlledSelect<AdminTicketsQueryFiltersType>
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

export default AdminTicketsFiltersForm;
