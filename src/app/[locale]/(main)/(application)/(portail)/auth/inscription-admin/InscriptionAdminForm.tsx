"use client";

import { RhfInput } from "@/components/rhf/RhfInput";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { accepterInvitationAdminAction } from "@/server/actions/entreprisesActions";
import {
  inscriptionAdminFormSchema,
  type InscriptionAdminFormType,
} from "@/zod-schemas/inscriptionAdmin.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm, useFormState } from "react-hook-form";
import { toast } from "sonner";

type InscriptionAdminFormProps = {
  token: string;
  email: string;
};

export default function InscriptionAdminForm({
  token,
  email,
}: InscriptionAdminFormProps) {
  const [success, setSuccess] = useState(false);

  const form = useForm<InscriptionAdminFormType>({
    resolver: zodResolver(inscriptionAdminFormSchema),
    mode: "onTouched",
    defaultValues: {
      prenom: "",
      nom: "",
      phone: "",
    },
  });

  const { isSubmitting } = useFormState({ control: form.control });

  const onSubmit = async (data: InscriptionAdminFormType) => {
    const result = await accepterInvitationAdminAction({
      token,
      prenom: data.prenom,
      nom: data.nom,
      phone: data.phone,
    });

    if (result?.serverError) {
      toast.error(result.serverError.message ?? "Une erreur est survenue.");
      return;
    }

    setSuccess(true);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <CheckCircle2 className="h-12 w-12 text-green-500" />
        <p className="font-medium">Votre compte a été créé !</p>
        <p className="text-muted-foreground text-sm">
          Un email a été envoyé à <strong>{email}</strong> pour définir votre
          mot de passe. Vous pourrez ensuite ajouter une photo de profil depuis
          vos paramètres.
        </p>
        <p className="text-muted-foreground text-xs">
          Si vous ne recevez pas l&apos;email, contactez un administrateur
          FM4ALL qui pourra vous renvoyer l&apos;email d&apos;activation.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Email</span>
            <p className="text-muted-foreground rounded-md border px-3 py-2 text-sm">
              {email}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <RhfInput<InscriptionAdminFormType>
              name="prenom"
              label="Prénom*"
              placeholder="Jean"
            />
            <RhfInput<InscriptionAdminFormType>
              name="nom"
              label="Nom*"
              placeholder="Dupont"
            />
          </div>

          <RhfInput<InscriptionAdminFormType>
            name="phone"
            label="Téléphone"
            placeholder="+33 6 12 34 56 78"
            type="tel"
          />

          <Button
            type="submit"
            className="w-full text-base"
            disabled={isSubmitting}
            size="lg"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              "Créer mon compte"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
