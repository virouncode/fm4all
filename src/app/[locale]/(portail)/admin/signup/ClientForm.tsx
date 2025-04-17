import { SelectClientType } from "@/zod-schemas/client";
import { useState } from "react";

type ClientFormProps = {
  clients?: SelectClientType[];
};

const ClientForm = ({ clients }: ClientFormProps) => {
  const [loading, setLoading] = useState(false);
  const [clientId, setClientId] = useState<number | null>(null);

  const defaultValues = {
    nomEntreprise: "",
    siret: "",
    prenomContact: "",
    nomContact: "",
    emailContact: "",
    phoneContact: "",
    surface: "",
    effectif: "",
    typeBatiment: "",
    typeOccupation: "",
    codePostal: "",
    ville: "",
  };

  const handleSelectClient = (value: string) => {
    // const selectedClientId = value ? parseInt(value) : null;
    // setFournisseurId(selectedClientId);
    // if (selectedClientId) {
    //   const client = clients?.find(({ id }) => id === selectedClientId);
    //   if (client) {
    //     form.reset({
    //       nomEntreprise: client.nomEntreprise,
    //       siret: fournisseur.siret,
    //       prenomContact: fournisseur.prenomContact,
    //       nomContact: fournisseur.nomContact,
    //       emailContact: fournisseur.emailContact,
    //       phoneContact: fournisseur.phoneContact,
    //     });
    //   } else {
    //     console.error("Fournisseur non trouvé");
    //     toast({
    //       variant: "destructive",
    //       title: tAuth("erreur"),
    //       description: tAdmin("fournisseur-non-trouve"),
    //     });
    //   }
    // } else {
    //   form.reset(defaultValues);
    // }
  };
  return (
    <>
      {/* {clients && clients.length > 0 && (
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <Label className="text-base" htmlFor="fournisseur">
            Client
          </Label>
          <Select
            value={clientId?.toString() || "0"}
            onValueChange={handleSelectClient}
            aria-label={tAdmin("selectionner-le-fournisseur")}
          >
            <SelectTrigger className={`w-full max-w-xs`} id="fournisseur">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">{tAdmin("nouveau-fournisseur")}</SelectItem>
              {clients.map((item) => (
                <SelectItem key={`${item.id}`} value={item.id.toString()}>
                  {item.nomEntreprise}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )} */}
    </>
  );
};

export default ClientForm;
