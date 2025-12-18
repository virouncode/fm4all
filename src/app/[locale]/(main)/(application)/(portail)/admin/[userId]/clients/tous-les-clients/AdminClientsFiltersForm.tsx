"use client";

import { RhfControlledSelect } from "@/components/rhf/RhfControlledSelect";
import { RhfInput } from "@/components/rhf/RhfInput";
import { Form } from "@/components/ui/form";
import { SelectItem } from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";
import {
  ClientsQueryBackendType,
  ClientsQueryFiltersType,
  SelectClientType,
} from "@/zod-schemas/client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";

type AdminClientsFiltersFormProps = {
  initialFilters: ClientsQueryBackendType;
  clients: SelectClientType[];
};

const AdminClientsFiltersForm = ({
  initialFilters,
  clients,
}: AdminClientsFiltersFormProps) => {
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const defaultValues: ClientsQueryFiltersType = {
    nomEntreprise: initialFilters.nomEntreprise ?? "all",
    siret: initialFilters.siret ?? "",
  };

  const form = useForm<ClientsQueryFiltersType>({
    defaultValues,
    mode: "onTouched",
  });

  const filters = useWatch({ control: form.control });

  // Debounce pour le champ siret
  const debouncedSiret = useDebounce(filters.siret ?? "", 500);

  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.nomEntreprise && filters.nomEntreprise !== "all") {
      params.set("nomEntreprise", filters.nomEntreprise);
    }
    if (debouncedSiret && debouncedSiret !== "") {
      params.set("siret", debouncedSiret);
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
  }, [filters.nomEntreprise, debouncedSiret, pathname, replace, searchParams]);

  return (
    <Form {...form}>
      <form className="flex flex-wrap gap-4">
        <RhfControlledSelect<ClientsQueryFiltersType>
          label="Nom de l'entreprise"
          name="nomEntreprise"
          selectClassName="w-64"
          withError={false}
        >
          <SelectItem value="all">Tous les clients</SelectItem>
          {clients.map((c) => (
            <SelectItem key={c.id} value={c.nomEntreprise}>
              {c.nomEntreprise}
            </SelectItem>
          ))}
        </RhfControlledSelect>

        <RhfInput<ClientsQueryFiltersType>
          name="siret"
          label="SIRET"
          placeholder="Rechercher par SIRET..."
          className="w-64"
        />
      </form>
    </Form>
  );
};

export default AdminClientsFiltersForm;
