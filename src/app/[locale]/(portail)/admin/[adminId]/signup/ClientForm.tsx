"use client";

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
import { authClient } from "@/lib/auth-client";
import { generatePassword } from "@/lib/generatePassword";
import { sendEmailFromClient } from "@/lib/sendEmail";
import { SelectClientType } from "@/zod-schemas/client";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

type ClientFormProps = {
  clients?: SelectClientType[];
};

const ClientForm = ({ clients }: ClientFormProps) => {
  const tAdmin = useTranslations("admin");
  const tAuth = useTranslations("auth");
  const [loading, setLoading] = useState(false);
  const [clientId, setClientId] = useState<number | null>(null);
  const client = clients?.find(({ id }) => id === clientId);

  const handleSelectClient = (value: string) => {
    const selectedClientId = value ? parseInt(value) : null;
    setClientId(selectedClientId);
  };

  const handleSubmit = async () => {
    if (!client) return;
    const tempPassword = generatePassword();
    const userToPost = {
      name: client?.nomEntreprise.toUpperCase(),
      email: client?.emailContact.toLowerCase(),
      password: tempPassword,
      role: "client",
      clientId,
    };
    await authClient.signUp.email(userToPost, {
      onRequest: () => {
        setLoading(true);
      },
      onSuccess: async () => {
        await sendEmailFromClient({
          to: client.emailContact,
          from: "noreply@fm4all.com",
          subject: "Création de votre compte client",
          text: `<p>Votre compte client a été crée avec succès, bienvenue chez fm4all !</p><br/>
                    <p>Voici mot de passe temporaire : ${tempPassword}</p><br/>
                    <p>Nous vous conseillons de le changer dès votre première connexion dans votre espace.</p>
                    <p>Pensez aussi à vérifier votre adresse email en cliquant sur le lien que nous vous avons envoyé.</p>
                    `,
          nomDestinataire: userToPost.name,
        });
        toast({
          variant: "default",
          title: tAuth("succes"),
          description: tAdmin(
            "le-compte-utilisateur-de-usertopost-name-a-ete-cree-avec-succes-un-email-avec-un-lien-de-verification-a-ete-envoye-a-usertopost-email",
            { userName: client.nomEntreprise, userEmail: client.nomContact }
          ),
        });
        setLoading(false);
      },
      onError: (ctx) => {
        toast({
          variant: "destructive",
          title: tAuth("erreur"),
          description:
            ctx.error.status === 422
              ? tAdmin(
                  "cet-email-est-deja-utilise-par-un-autre-compte-utilisateur"
                )
              : (ctx.error.message ??
                tAdmin(
                  "une-erreur-est-survenue-lors-de-la-creation-de-lutilisateur"
                )),
        });
        setLoading(false);
      },
    });
  };

  return (
    <>
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
            disabled={loading || !clientId}
            onClick={handleSubmit}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              tAdmin("creer-un-compte")
            )}
          </Button>
        </div>
      )}
    </>
  );
};

export default ClientForm;
