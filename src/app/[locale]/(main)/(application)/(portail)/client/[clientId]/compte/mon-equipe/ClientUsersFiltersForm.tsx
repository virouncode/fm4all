"use client";

import { RhfInput } from "@/components/rhf/RhfInput";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useDebounce } from "@/hooks/use-debounce";
import { Link } from "@/i18n/navigation";
import {
  ClientUsersQueryBackendType,
  ClientUsersQueryFiltersType,
} from "@/zod-schemas/user";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";

type ClientUsersFiltersFormProps = {
  initialFilters: ClientUsersQueryBackendType;
  clientId: number;
};

const ClientUsersFiltersForm = ({
  initialFilters,
  clientId,
}: ClientUsersFiltersFormProps) => {
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const defaultValues: ClientUsersQueryFiltersType = {
    lastName: initialFilters.lastName ?? "",
    firstName: initialFilters.firstName ?? "",
    email: initialFilters.email ?? "",
  };

  const form = useForm<ClientUsersQueryFiltersType>({
    defaultValues,
    mode: "onTouched",
  });

  const filters = useWatch({ control: form.control });
  const effectiveFilters = useDebounce(filters, 400);

  useEffect(() => {
    const params = new URLSearchParams();

    if (effectiveFilters.lastName) {
      params.set("lastName", effectiveFilters.lastName);
    }
    if (effectiveFilters.firstName) {
      params.set("firstName", effectiveFilters.firstName);
    }
    if (effectiveFilters.email) {
      params.set("email", effectiveFilters.email);
    }
    const next = `${pathname}?${params.toString()}`;
    const current = `${pathname}?${searchParams.toString()}`;

    if (next !== current) {
      replace(next, { scroll: false });
    }
  }, [effectiveFilters, pathname, replace]);

  return (
    <div className="flex items-center justify-between">
      <Form {...form}>
        <form className="flex flex-wrap gap-4">
          <RhfInput<ClientUsersQueryFiltersType>
            label="Nom"
            name="lastName"
            className="w-60"
            withError={false}
          />
          <RhfInput<ClientUsersQueryFiltersType>
            label="Prénom"
            name="firstName"
            className="w-60"
            withError={false}
          />
          <RhfInput<ClientUsersQueryFiltersType>
            label="Email"
            name="email"
            className="w-60"
            withError={false}
          />
        </form>
      </Form>
      <Link
        href={{
          pathname: "/client/[clientId]/compte/mon-equipe/ajouter",
          params: { clientId },
        }}
      >
        <Button> Ajouter un membre</Button>
      </Link>
    </div>
  );
};

export default ClientUsersFiltersForm;
