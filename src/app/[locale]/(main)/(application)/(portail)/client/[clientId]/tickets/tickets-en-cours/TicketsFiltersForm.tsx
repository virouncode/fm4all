"use client";

import { RhfControlledSelect } from "@/components/rhf/RhfControlledSelect";
import { RhfDatePicker } from "@/components/rhf/RhfDatePicker";
import { Form } from "@/components/ui/form";
import { SelectItem } from "@/components/ui/select";
import {
  ticketCategorieCT,
  ticketPrioriteCT,
  ticketStatusCT,
} from "@/constants/codeTables";
import { DEFAULT_PAGE_SIZE } from "@/constants/pagination";
import {
  ticketsQueryFiltersSchema,
  TicketsQueryFiltersType,
} from "@/zod-schemas/ticket";
import { zodResolver } from "@hookform/resolvers/zod";
import { DateTime } from "luxon";
import { useRouter } from "next/navigation";
import qs from "query-string";
import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";

type TicketsFiltersFormProps = {
  clientId: number;
};

const TicketsFiltersForm = ({ clientId }: TicketsFiltersFormProps) => {
  const { replace } = useRouter();

  const defaultValues: TicketsQueryFiltersType = {
    createdFrom: "",
    createdTo: "",
    categorie: "all",
    priorite: "all",
    status: "all",
    fournisseurId: "",
    siteId: "",
  };
  const form = useForm<TicketsQueryFiltersType>({
    defaultValues,
    mode: "onTouched",
    resolver: zodResolver(ticketsQueryFiltersSchema),
  });
  const filters = useWatch({ control: form.control });
  const start = useWatch({ control: form.control, name: "createdFrom" });
  const end = useWatch({ control: form.control, name: "createdTo" });

  useEffect(() => {
    if (!start || !end) return; // ⬅️ si l’un des deux est vide, on ne touche à rien

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
    if (!filters) return;
    const newQuery = {
      ...filters,
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
    };
    const url = qs.stringifyUrl(
      {
        url: `/client/${clientId}/tickets/tickets-en-cours`,
        query: Object.fromEntries(
          Object.entries(newQuery).filter(([_, v]) => v && v !== "all"),
        ),
      },
      { skipNull: true, skipEmptyString: true },
    );

    replace(url);
  }, [filters, replace]);

  return (
    <Form {...form}>
      <form className="flex flex-wrap gap-4">
        <RhfDatePicker<TicketsQueryFiltersType>
          label="Du"
          name="createdFrom"
          buttonClassName="w-36"
          withError={false}
        />
        <RhfDatePicker<TicketsQueryFiltersType>
          label="Au"
          name="createdTo"
          min={minTo}
          buttonClassName="w-36"
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
        {/* TODO Fournisseur et Sites */}
      </form>
    </Form>
  );
};

export default TicketsFiltersForm;
