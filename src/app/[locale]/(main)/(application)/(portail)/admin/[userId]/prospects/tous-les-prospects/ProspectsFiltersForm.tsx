"use client";

import { RhfDatePicker } from "@/components/rhf/RhfDatePicker";
import { RhfInput } from "@/components/rhf/RhfInput";
import { Form } from "@/components/ui/form";
import { useDebounce } from "@/hooks/use-debounce";
import {
  ProspectsQueryBackendType,
  ProspectsQueryFiltersType,
} from "@/zod-schemas/prospect";
import { DateTime } from "luxon";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";

type ProspectsFiltersFormProps = {
  initialFilters: ProspectsQueryBackendType;
};

const ProspectsFiltersForm = ({
  initialFilters,
}: ProspectsFiltersFormProps) => {
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const defaultValues: ProspectsQueryFiltersType = {
    // dates → string (yyyy-mm-dd) ou ""
    createdFrom: initialFilters.createdFrom
      ? initialFilters.createdFrom.toISOString().slice(0, 10)
      : "",
    createdTo: initialFilters.createdTo
      ? initialFilters.createdTo.toISOString().slice(0, 10)
      : "",
    nomEntreprise: initialFilters.nomEntreprise ?? "",
    siret: initialFilters.siret ?? "",
    nomContact: initialFilters.nomContact ?? "",
    emailContact: initialFilters.emailContact ?? "",
    phoneContact: initialFilters.phoneContact ?? "",
    codePostal: initialFilters.codePostal ?? "",
    ville: initialFilters.ville ?? "",
  };
  const form = useForm<ProspectsQueryFiltersType>({
    defaultValues,
    mode: "onTouched",
  });
  const filters = useWatch({ control: form.control });
  const start = useWatch({ control: form.control, name: "createdFrom" });
  const end = useWatch({ control: form.control, name: "createdTo" });

  const textFilters = {
    nomEntreprise: filters.nomEntreprise,
    siret: filters.siret,
    nomContact: filters.nomContact,
    emailContact: filters.emailContact,
    phoneContact: filters.phoneContact,
    codePostal: filters.codePostal,
    ville: filters.ville,
  };

  // 3) On debounce UNIQUEMENT les champs texte
  const debouncedTextFilters = useDebounce(textFilters, 400);

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
    const params = new URLSearchParams();

    if (filters.createdFrom) {
      params.set("createdFrom", filters.createdFrom);
    }
    if (filters.createdTo) {
      params.set("createdTo", filters.createdTo);
    }
    if (debouncedTextFilters.nomEntreprise) {
      params.set("nomEntreprise", debouncedTextFilters.nomEntreprise);
    }
    if (debouncedTextFilters.siret) {
      params.set("siret", debouncedTextFilters.siret);
    }
    if (debouncedTextFilters.nomContact) {
      params.set("nomContact", debouncedTextFilters.nomContact);
    }
    if (debouncedTextFilters.emailContact) {
      params.set("emailContact", debouncedTextFilters.emailContact);
    }
    if (debouncedTextFilters.phoneContact) {
      params.set("phoneContact", debouncedTextFilters.phoneContact);
    }
    if (debouncedTextFilters.codePostal) {
      params.set("codePostal", debouncedTextFilters.codePostal);
    }
    if (debouncedTextFilters.ville) {
      params.set("ville", debouncedTextFilters.ville);
    }

    const next = `${pathname}?${params.toString()}`;
    const current = `${pathname}?${searchParams.toString()}`;

    if (next !== current) {
      replace(next, { scroll: false });
    }
  }, [
    filters,
    pathname,
    replace,
    debouncedTextFilters.codePostal,
    debouncedTextFilters.emailContact,
    debouncedTextFilters.nomContact,
    debouncedTextFilters.nomEntreprise,
    debouncedTextFilters.phoneContact,
    debouncedTextFilters.siret,
    debouncedTextFilters.ville,
  ]);

  return (
    <Form {...form}>
      <form className="flex flex-wrap gap-4">
        <RhfDatePicker<ProspectsQueryFiltersType>
          label="Crée du"
          name="createdFrom"
          buttonClassName="w-40"
          withError={false}
        />
        <RhfDatePicker<ProspectsQueryFiltersType>
          label="Au"
          name="createdTo"
          min={minTo}
          buttonClassName="w-40"
          withError={false}
        />
        <RhfInput<ProspectsQueryFiltersType>
          label="Nom de l'entreprise"
          name="nomEntreprise"
          inputClassName="w-40"
          withError={false}
        />
        <RhfInput<ProspectsQueryFiltersType>
          label="SIRET"
          name="siret"
          inputClassName="w-40"
          withError={false}
        />
        <RhfInput<ProspectsQueryFiltersType>
          label="Nom du contact"
          name="nomContact"
          inputClassName="w-40"
          withError={false}
        />
        <RhfInput<ProspectsQueryFiltersType>
          label="Email du contact"
          name="emailContact"
          inputClassName="w-40"
          withError={false}
        />
        <RhfInput<ProspectsQueryFiltersType>
          label="N° tél du contact"
          name="phoneContact"
          inputClassName="w-40"
          withError={false}
        />
        <RhfInput<ProspectsQueryFiltersType>
          label="Code postal"
          name="codePostal"
          inputClassName="w-40"
          withError={false}
        />
        <RhfInput<ProspectsQueryFiltersType>
          label="Ville"
          name="ville"
          inputClassName="w-40"
          withError={false}
        />
      </form>
    </Form>
  );
};

export default ProspectsFiltersForm;
