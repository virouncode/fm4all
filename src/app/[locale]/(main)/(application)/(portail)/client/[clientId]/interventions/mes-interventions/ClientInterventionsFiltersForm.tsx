"use client";

import { RhfControlledSelect } from "@/components/rhf/RhfControlledSelect";
import { RhfDatePicker } from "@/components/rhf/RhfDatePicker";
import { Form } from "@/components/ui/form";
import { SelectItem } from "@/components/ui/select";
import {
  interventionStatusCT,
  interventionTypeCT,
} from "@/constants/codeTables";
import { DEFAULT_PAGE_SIZE } from "@/constants/pagination";
import { SelectFournisseurType } from "@/zod-schemas/fournisseur";
import {
  interventionsQueryFiltersSchema,
  InterventionsQueryFiltersType,
} from "@/zod-schemas/intervention";
import { SelectSiteType } from "@/zod-schemas/site";
import { zodResolver } from "@hookform/resolvers/zod";
import { DateTime } from "luxon";
import { useRouter } from "next/navigation";
import qs from "query-string";
import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";

type ClientInterventionsFiltersFormProps = {
  clientId: number;
  sites: SelectSiteType[];
  fournisseurs: SelectFournisseurType[];
};

const ClientInterventionsFiltersForm = ({
  clientId,
  sites,
  fournisseurs,
}: ClientInterventionsFiltersFormProps) => {
  const { replace } = useRouter();

  const defaultValues: InterventionsQueryFiltersType = {
    dateDebutPrevueFrom: "",
    dateDebutPrevueTo: "",
    type: "all",
    status: "all",
    fournisseurId: "0",
    siteId: "0",
  };

  const form = useForm<InterventionsQueryFiltersType>({
    defaultValues,
    mode: "onTouched",
    resolver: zodResolver(interventionsQueryFiltersSchema),
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

  useEffect(() => {
    if (!start || !end) return; // ⬅️ si l’un des deux est vide, on ne touche à rien

    const startDt = DateTime.fromISO(start).startOf("day");
    const endDt = DateTime.fromISO(end).startOf("day");

    // Cas : from >= to -> on force to = from + 1 jour
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

  useEffect(() => {
    if (!filters) return;
    const newQuery = {
      ...filters,
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
    };
    if (newQuery.fournisseurId === "0") delete newQuery.fournisseurId;
    if (newQuery.siteId === "0") delete newQuery.siteId;
    const url = qs.stringifyUrl(
      {
        url: `/client/${clientId}/interventions/mes-interventions`,
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
        <RhfDatePicker<InterventionsQueryFiltersType>
          label="Date programmée du"
          name="dateDebutPrevueFrom"
          buttonClassName="w-40"
          withError={false}
        />
        <RhfDatePicker<InterventionsQueryFiltersType>
          label="Au"
          name="dateDebutPrevueTo"
          min={minTo}
          buttonClassName="w-40"
          withError={false}
        />
        <RhfControlledSelect<InterventionsQueryFiltersType>
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
        <RhfControlledSelect<InterventionsQueryFiltersType>
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
        <RhfControlledSelect<InterventionsQueryFiltersType>
          label="Prestataire"
          name="fournisseurId"
          selectClassName="w-40"
          withError={false}
        >
          <SelectItem value="0">Tous</SelectItem>
          {fournisseurs.map((f) => (
            <SelectItem key={f.id} value={f.id.toString()}>
              {f.nomFournisseur}
            </SelectItem>
          ))}
        </RhfControlledSelect>
        <RhfControlledSelect<InterventionsQueryFiltersType>
          label="Site"
          name="siteId"
          selectClassName="w-40"
          withError={false}
        >
          <SelectItem value="0">Tous</SelectItem>
          {sites.map((s) => (
            <SelectItem key={s.id} value={s.id.toString()}>
              {s.nomSite}
            </SelectItem>
          ))}
        </RhfControlledSelect>
      </form>
    </Form>
  );
};

export default ClientInterventionsFiltersForm;
