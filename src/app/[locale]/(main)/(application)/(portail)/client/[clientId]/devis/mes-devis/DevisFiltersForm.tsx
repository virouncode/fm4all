"use client";

import { RhfControlledSelect } from "@/components/rhf/RhfControlledSelect";
import { RhfDatePicker } from "@/components/rhf/RhfDatePicker";
import { RhfInput } from "@/components/rhf/RhfInput";
import { Form } from "@/components/ui/form";
import { SelectItem } from "@/components/ui/select";
import { devisStatusCT, devisTypePrixCT } from "@/constants/codeTables";
import { useDebounce } from "@/hooks/use-debounce";
import {
  DevisQueryBackendType,
  DevisQueryFiltersType,
} from "@/zod-schemas/devis";
import { SelectFournisseurType } from "@/zod-schemas/fournisseur";
import { SelectSiteType } from "@/zod-schemas/site";
import { DateTime } from "luxon";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";

type DevisFiltersFormProps = {
  initialFilters: DevisQueryBackendType;
  sites: SelectSiteType[];
  fournisseurs: SelectFournisseurType[];
};

const DevisFiltersForm = ({
  initialFilters,
  sites,
  fournisseurs,
}: DevisFiltersFormProps) => {
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const defaultValues: DevisQueryFiltersType = {
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
  const form = useForm<DevisQueryFiltersType>({
    defaultValues,
    mode: "onTouched",
  });
  const filters = useWatch({ control: form.control });
  const createdStart = useWatch({ control: form.control, name: "createdFrom" });
  const createdEnd = useWatch({ control: form.control, name: "createdTo" });
  const validStart = useWatch({ control: form.control, name: "validFrom" });
  const validEnd = useWatch({ control: form.control, name: "validTo" });
  const debouncedTitre = useDebounce(filters.titre, 400);

  useEffect(() => {
    if (!createdStart || !createdEnd) return; // ⬅️ si l’un des deux est vide, on ne touche à rien

    const startDt = DateTime.fromISO(createdStart).startOf("day");
    const endDt = DateTime.fromISO(createdEnd).startOf("day");

    // Cas : from >= to -> on force to = from + 1 jour
    if (endDt <= startDt) {
      const newEnd = startDt.plus({ days: 1 }).startOf("day").toISODate() ?? "";

      form.setValue("createdTo", newEnd, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [createdStart, createdEnd, form]);

  useEffect(() => {
    if (!validStart || !validEnd) return; // ⬅️ si l’un des deux est vide, on ne touche à rien

    const startDt = DateTime.fromISO(validStart).startOf("day");
    const endDt = DateTime.fromISO(validEnd).startOf("day");

    // Cas : from >= to -> on force to = from + 1 jour
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

  useEffect(() => {
    const params = new URLSearchParams();

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

    const next = `${pathname}?${params.toString()}`;
    const current = `${pathname}?${searchParams.toString()}`;

    if (next !== current) {
      replace(next, { scroll: false });
    }
  }, [filters, pathname, replace, debouncedTitre]);

  return (
    <Form {...form}>
      <form className="flex flex-wrap gap-4">
        <RhfDatePicker<DevisQueryFiltersType>
          label="Crée du"
          name="createdFrom"
          buttonClassName="w-40"
          withError={false}
        />
        <RhfDatePicker<DevisQueryFiltersType>
          label="Au"
          name="createdTo"
          min={minCreatedTo}
          buttonClassName="w-40"
          withError={false}
        />
        <RhfDatePicker<DevisQueryFiltersType>
          label="Valide du"
          name="validFrom"
          buttonClassName="w-40"
          withError={false}
        />
        <RhfDatePicker<DevisQueryFiltersType>
          label="Au"
          name="validTo"
          min={minValidTo}
          buttonClassName="w-40"
          withError={false}
        />
        <RhfControlledSelect<DevisQueryFiltersType>
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
        <RhfControlledSelect<DevisQueryFiltersType>
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
        <RhfControlledSelect<DevisQueryFiltersType>
          label="Prestataire"
          name="fournisseurId"
          selectClassName="w-40"
          withError={false}
        >
          <SelectItem value="all">Tous</SelectItem>
          {fournisseurs.map((f) => (
            <SelectItem key={f.id} value={f.id.toString()}>
              {f.nomFournisseur}
            </SelectItem>
          ))}
        </RhfControlledSelect>
        <RhfControlledSelect<DevisQueryFiltersType>
          label="Site"
          name="siteId"
          selectClassName="w-40"
          withError={false}
        >
          <SelectItem value="all">Tous</SelectItem>
          {sites.map((s) => (
            <SelectItem key={s.id} value={s.id.toString()}>
              {s.nomSite}
            </SelectItem>
          ))}
        </RhfControlledSelect>
        <RhfInput<DevisQueryFiltersType>
          label="Titre"
          name="titre"
          inputClassName="w-60"
          withError={false}
        />
      </form>
    </Form>
  );
};

export default DevisFiltersForm;
