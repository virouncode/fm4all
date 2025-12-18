"use client";

import { RhfControlledSelect } from "@/components/rhf/RhfControlledSelect";
import { RhfInput } from "@/components/rhf/RhfInput";
import { Form } from "@/components/ui/form";
import { SelectItem } from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";
import {
  AdminFournisseursQueryBackendType,
  AdminFournisseursQueryFiltersType,
  SelectFournisseurType,
} from "@/zod-schemas/fournisseur";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";

type AdminFournisseursFiltersFormProps = {
  initialFilters: AdminFournisseursQueryBackendType;
  allFournisseurs: SelectFournisseurType[];
};

const AdminFournisseursFiltersForm = ({
  initialFilters,
  allFournisseurs,
}: AdminFournisseursFiltersFormProps) => {
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const defaultValues: AdminFournisseursQueryFiltersType = {
    nomFournisseur: initialFilters.nomFournisseur ?? "all",
    siret: initialFilters.siret ?? "",
    emailContact: initialFilters.emailContact ?? "",
    phoneContact: initialFilters.phoneContact ?? "",
  };

  const form = useForm<AdminFournisseursQueryFiltersType>({
    defaultValues,
    mode: "onTouched",
  });

  const filters = useWatch({ control: form.control });

  // Debounce pour les champs texte
  const debouncedSiret = useDebounce(filters.siret ?? "", 500);
  const debouncedEmail = useDebounce(filters.emailContact ?? "", 500);
  const debouncedPhone = useDebounce(filters.phoneContact ?? "", 500);

  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.nomFournisseur && filters.nomFournisseur !== "all") {
      params.set("nomFournisseur", filters.nomFournisseur);
    }
    if (debouncedSiret && debouncedSiret !== "") {
      params.set("siret", debouncedSiret);
    }
    if (debouncedEmail && debouncedEmail !== "") {
      params.set("emailContact", debouncedEmail);
    }
    if (debouncedPhone && debouncedPhone !== "") {
      params.set("phoneContact", debouncedPhone);
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
    filters.nomFournisseur,
    debouncedSiret,
    debouncedEmail,
    debouncedPhone,
    pathname,
    replace,
    searchParams,
  ]);

  return (
    <Form {...form}>
      <form className="flex flex-wrap gap-4">
        <RhfControlledSelect<AdminFournisseursQueryFiltersType>
          label="Fournisseur"
          name="nomFournisseur"
          selectClassName="w-56"
          withError={false}
        >
          <SelectItem value="all">Tous les fournisseurs</SelectItem>
          {allFournisseurs.map((f) => (
            <SelectItem key={f.id} value={f.nomFournisseur}>
              {f.nomFournisseur}
            </SelectItem>
          ))}
        </RhfControlledSelect>

        <RhfInput<AdminFournisseursQueryFiltersType>
          name="siret"
          label="SIRET"
          placeholder="Rechercher..."
          className="w-40"
        />

        <RhfInput<AdminFournisseursQueryFiltersType>
          name="emailContact"
          label="Email"
          placeholder="Rechercher..."
          className="w-48"
        />

        <RhfInput<AdminFournisseursQueryFiltersType>
          name="phoneContact"
          label="Téléphone"
          placeholder="Rechercher..."
          className="w-40"
        />
      </form>
    </Form>
  );
};

export default AdminFournisseursFiltersForm;
