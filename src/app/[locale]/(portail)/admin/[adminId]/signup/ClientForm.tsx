"use client";

import { insertUserAction } from "@/actions/userAction";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { SelectClientType } from "@/zod-schemas/client";
import { InsertUserType } from "@/zod-schemas/user";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { useForm } from "react-hook-form";

type ClientFormProps = {
  clients?: SelectClientType[];
};

const ClientForm = ({ clients }: ClientFormProps) => {
  const tAdmin = useTranslations("admin");
  const tAuth = useTranslations("auth");
  const [clientId, setClientId] = useState<number | null>(null);
  const client = clients?.find(({ id }) => id === clientId);

  const defaultValues: InsertUserType = {
    name: client?.nomEntreprise ?? "",
    email: client?.emailContact ?? "",
    password: "temp",
    role: "client",
    clientId,
    image: null,
  };
  const form = useForm<InsertUserType>({
    mode: "onBlur",
    // resolver: zodResolver(insertUserSchema),
    defaultValues,
  });
  const {
    execute: executeSaveUser,
    isPending: isSavingUser,
    reset: resetSaveUserAction,
  } = useAction(insertUserAction, {
    onSuccess: ({ data }) => {
      toast({
        variant: "default",
        title: tAuth("succes"),
        description: data?.message,
      });
      resetSaveUserAction();
      setClientId(null);
      form.reset();
    },
    onError: ({ error }) => {
      toast({
        variant: "destructive",
        title: tAuth("erreur"),
        description:
          error?.serverError ||
          tAuth(
            "une-erreur-est-survenue-lors-de-la-creation-du-compte-utilisateur"
          ),
      });
    },
  });

  const handleSelectClient = (value: string) => {
    const selectedClientId = value ? parseInt(value) : null;
    setClientId(selectedClientId);
  };

  const submitForm = async () => {
    if (!client) return;
    executeSaveUser(defaultValues);
  };

  return (
    <form onSubmit={form.handleSubmit(submitForm)}>
      {clients && clients.length > 0 && (
        <div className="flex flex-col gap-10">
          <div className="flex gap-4 w-full items-center">
            <Label className="text-base" htmlFor="client">
              {tAdmin("creer-un-compte-client-pour")}
            </Label>
            <Select
              value={clientId?.toString() || "0"}
              onValueChange={handleSelectClient}
              aria-label={tAdmin("selectionner-le-client")}
            >
              <SelectTrigger className={`w-full max-w-xs`} id="client">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0" disabled>
                  {tAdmin("selectionner-le-client")}
                </SelectItem>
                {clients.map((item) => (
                  <SelectItem key={`${item.id}`} value={item.id.toString()}>
                    {item.nomEntreprise}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex gap-4 w-full items-center">
              <Label className="text-base">{tAdmin("nom-du-contact")} :</Label>
              {client && <p>{client.nomContact}</p>}
            </div>
            <div className="flex gap-4 w-full items-center">
              <Label className="text-base">
                {tAdmin("email-du-contact")} :
              </Label>
              {client && <p>{client.emailContact}</p>}
            </div>
          </div>

          <Button
            variant="destructive"
            size="lg"
            title={tAdmin("creer-un-compte")}
            className="text-base mt-6 w-full"
            disabled={isSavingUser || !clientId}
          >
            {isSavingUser ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              tAdmin("creer-un-compte")
            )}
          </Button>
        </div>
      )}
    </form>
  );
};

export default ClientForm;
