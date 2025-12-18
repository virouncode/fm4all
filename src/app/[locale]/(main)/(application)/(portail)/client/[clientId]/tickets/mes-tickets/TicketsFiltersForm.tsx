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
import { SelectFournisseurType } from "@/zod-schemas/fournisseur";
import { SelectSiteType } from "@/zod-schemas/site";
import {
  TicketsQueryBackendType,
  TicketsQueryFiltersType,
} from "@/zod-schemas/ticket";
import { DateTime } from "luxon";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";

type TicketsFiltersFormProps = {
  initialFilters: TicketsQueryBackendType;
  sites: SelectSiteType[];
  fournisseurs: SelectFournisseurType[];
  isDevisTickets?: boolean;
};

const TicketsFiltersForm = ({
  initialFilters,
  sites,
  fournisseurs,
  isDevisTickets = false,
}: TicketsFiltersFormProps) => {
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const defaultValues: TicketsQueryFiltersType = {
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
  const form = useForm<TicketsQueryFiltersType>({
    defaultValues,
    mode: "onTouched",
  });
  const filters = useWatch({ control: form.control });
  const start = useWatch({ control: form.control, name: "createdFrom" });
  const end = useWatch({ control: form.control, name: "createdTo" });

  useEffect(() => {
    if (!start || !end) return; // ⬅️ si l'un des deux est vide, on ne touche à rien

    const startDt = DateTime.fromISO(start).startOf("day");
    const endDt = DateTime.fromISO(end).startOf("day");

    // Cas : from >= to -> on force to = from + 1 jour
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

  useEffect(() => {
    const params = new URLSearchParams();

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

    const next = `${pathname}?${params.toString()}`;
    const current = `${pathname}?${searchParams.toString()}`;

    if (next !== current) {
      replace(next, { scroll: false });
    }
  }, [filters, pathname, replace]);

  return (
    <Form {...form}>
      <form className="flex flex-wrap gap-4">
        <RhfDatePicker<TicketsQueryFiltersType>
          label="Du"
          name="createdFrom"
          buttonClassName="w-40"
          withError={false}
        />
        <RhfDatePicker<TicketsQueryFiltersType>
          label="Au"
          name="createdTo"
          min={minTo}
          buttonClassName="w-40"
          withError={false}
        />

        <RhfControlledSelect<TicketsQueryFiltersType>
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

        <RhfControlledSelect<TicketsQueryFiltersType>
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

        <RhfControlledSelect<TicketsQueryFiltersType>
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
          <RhfControlledSelect<TicketsQueryFiltersType>
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
        <RhfControlledSelect<TicketsQueryFiltersType>
          label="Site"
          name="siteId"
          selectClassName="w-40"
          withError={false}
        >
          <SelectItem value="all">Tous</SelectItem>
          {sites.map((s) => (
            <SelectItem key={s.id} value={String(s.id)}>
              {s.nomSite}
            </SelectItem>
          ))}
        </RhfControlledSelect>
        <RhfControlledSelect<TicketsQueryFiltersType>
          label="Prestataire"
          name="fournisseurId"
          selectClassName="w-40"
          withError={false}
        >
          <SelectItem value="all">Tous</SelectItem>
          {fournisseurs.map((f) => (
            <SelectItem key={f.id} value={String(f.id)}>
              {f.nomFournisseur}
            </SelectItem>
          ))}
        </RhfControlledSelect>
      </form>
    </Form>
  );
};

export default TicketsFiltersForm;
