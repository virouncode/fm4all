"use client";

import { updateFournisseurAction } from "@/actions/fournisseurAction";
import FournisseurDialog from "@/app/[locale]/(main)/(application)/devis/FournisseurDialog";
import { InputWithLabel } from "@/components/form-inputs/InputWithLabel";
import { TextAreaWithLabel } from "@/components/form-inputs/TextAreaWithLabel";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { deleteVercelBlob } from "@/lib/queries/vercel-blob/deleteVercelBlob";
import { postVercelBlob } from "@/lib/queries/vercel-blob/postVercelBlob";
import {
  createUpdateFournisseurFormSchema,
  SelectFournisseurType,
  UpdateFournisseurFormType,
  UpdateFournisseurType,
} from "@/zod-schemas/fournisseur";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAction } from "next-safe-action/hooks";
import Image from "next/image";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";

type FournisseurUpdateFormProps = {
  initialFournisseur: SelectFournisseurType;
};

const FournisseurUpdateForm = ({
  initialFournisseur,
}: FournisseurUpdateFormProps) => {
  const tAuth = useTranslations("auth");
  const tAdmin = useTranslations("admin");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialFournisseur.logoUrl,
  );
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultValues: UpdateFournisseurFormType = {
    ...initialFournisseur,
    anneeCreation: initialFournisseur.anneeCreation?.toString() ?? "",
    nbClients: initialFournisseur.nbClients?.toString() ?? "",
    nbAvis: initialFournisseur.nbAvis?.toString() ?? "",
    presentation: initialFournisseur.presentation ?? "",
  };
  const form = useForm<UpdateFournisseurFormType>({
    mode: "all",
    resolver: zodResolver(
      createUpdateFournisseurFormSchema({
        nomFournisseur: "Nom de l'entreprise obligatoire",
        siret: "Siret invalide",
        prenomContact: "Prénom du contact obligatoire",
        nomContact: "Nom du contact obligatoire",
        emailContact: "Email du contact invalide",
        phoneContact: "Numéro de téléphone obligatoire",
      }),
    ),
    defaultValues,
  });

  const {
    execute: executeUpdateFournisseur,
    isPending: isUpdatingFournisseur,
    reset: resetUpdateFournisseurAction,
  } = useAction(updateFournisseurAction, {
    onSuccess: ({ data }) => {
      toast({
        variant: "default",
        title: tAuth("succes"),
        description: data?.message,
      });
      resetUpdateFournisseurAction();
      window.location.reload();
    },
    onError: ({ error }) => {
      toast({
        variant: "destructive",
        title: tAuth("erreur"),
        description:
          error?.serverError ||
          tAuth(
            "une-erreur-est-survenue-lors-de-la-mise-a-jour-du-fournisseur",
          ),
      });
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitForm = async (data: UpdateFournisseurFormType) => {
    let imageUrl: string | null = null;
    setLoading(true);
    //Si je ne vois pas d'image à l'ecran et que le fournisseur a une image, je la supprime
    if (!imagePreview && initialFournisseur.logoUrl) {
      await deleteVercelBlob({ url: initialFournisseur.logoUrl });
    } else if (image) {
      //Je vois une nouvelle image à l'écran
      if (initialFournisseur.logoUrl)
        // Si j'avais une image avant, je la supprime
        await deleteVercelBlob({ url: initialFournisseur.logoUrl });
      imageUrl = await postVercelBlob({
        // Je charge la nouvelle image
        file: image,
        filename: `logo_${data.nomFournisseur}`,
        foldername: "logos_fournisseurs",
      });
    }
    const fournisseurToUpdate: UpdateFournisseurType = {
      ...data,
      logoUrl: imageUrl,
      nbAvis: data.nbAvis ? parseInt(data.nbAvis) : null,
      nbClients: data.nbClients ? parseInt(data.nbClients) : null,
      anneeCreation: data.anneeCreation ? parseInt(data.anneeCreation) : null,
    };
    executeUpdateFournisseur(fournisseurToUpdate);
    setLoading(false);
  };

  return (
    <Card className="mx-auto h-[60%] w-full rounded-md sm:w-3/4 lg:w-2/3">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">
          <div className="flex items-center justify-between">
            <p>Mon profil</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="lg"
                  title="Comment vous apparaissez dans le funnel"
                >
                  Aperçu
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90%] w-5/6 overflow-y-auto rounded-xl sm:max-w-[425px] lg:w-auto">
                <DialogHeader>
                  <DialogTitle>{form.getValues().nomFournisseur}</DialogTitle>
                </DialogHeader>
                <FournisseurDialog
                  sloganFournisseur={form.watch("slogan") ?? ""}
                  logoUrl={imagePreview}
                  nomFournisseur={form.watch("nomFournisseur") ?? ""}
                  presentation={form.watch("presentation") ?? ""}
                  locationUrl={form.watch("locationUrl") ?? ""}
                  anneeCreation={
                    form.watch("anneeCreation")
                      ? parseInt(form.watch("anneeCreation") ?? "")
                      : null
                  }
                  ca={form.watch("ca") ?? ""}
                  effectif={form.watch("effectif") ?? ""}
                  nbClients={
                    form.watch("nbClients")
                      ? parseInt(form.watch("nbClients") ?? "")
                      : null
                  }
                  noteGoogle={form.watch("noteGoogle") ?? ""}
                  nbAvis={
                    form.watch("nbAvis")
                      ? parseInt(form.watch("nbAvis") ?? "")
                      : null
                  }
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardTitle>
        <CardDescription className="max-w-prose text-sm italic md:text-base">
          👉 Comment vous apparaissez sur les offres du funnel
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submitForm)} className="grid gap-2">
            <div className="flex flex-col gap-2 md:grid md:grid-cols-2 md:gap-6">
              <div className="col-span-2 mb-6 md:mb-0">
                <TextAreaWithLabel<UpdateFournisseurFormType>
                  fieldTitle="Slogan"
                  nameInSchema="slogan"
                  rows={3}
                  className="resize-none"
                  placeholder="Votre phrase d'accroche, votre slogan..."
                />
              </div>
              <div className="col-span-2 flex flex-col gap-2">
                <Label className="text-base">Logo de l&apos;entreprise</Label>
                {!imagePreview ? (
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className={
                      "mb-6 w-full max-w-xs disabled:text-blue-500 disabled:opacity-75 dark:disabled:text-yellow-300"
                    }
                    ref={fileInputRef}
                  />
                ) : (
                  <div className="flex w-full items-center gap-4">
                    <div className="relative h-24 flex-1 overflow-hidden rounded-full object-cover">
                      <Image
                        src={imagePreview}
                        alt="Logo de l'entreprise"
                        fill
                        className="object-contain object-center"
                        sizes="(max-width:768px) 50vw, 100vw"
                      />
                    </div>
                    <X
                      className="cursor-pointer"
                      onClick={() => {
                        setImage(null);
                        setImagePreview(null);
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="col-span-2 mb-6 md:mb-0">
                <TextAreaWithLabel<UpdateFournisseurFormType>
                  fieldTitle="Présentation de l'entreprise"
                  nameInSchema="presentation"
                  rows={10}
                  placeholder="Présentez l'entreprise, ses valeurs, son histoire, ses produits..."
                  className="resize-none"
                />
              </div>
              <InputWithLabel<UpdateFournisseurFormType>
                fieldTitle="Annee de création"
                nameInSchema="anneeCreation"
                type="number"
              />
              <InputWithLabel<UpdateFournisseurFormType>
                fieldTitle="Chiffre d'affaire (€/an)"
                nameInSchema="ca"
              />
              <InputWithLabel<UpdateFournisseurFormType>
                fieldTitle="Nombre d'employés"
                nameInSchema="effectif"
              />
              <InputWithLabel<UpdateFournisseurFormType>
                fieldTitle="Nombre de clients (B2B)"
                nameInSchema="nbClients"
              />
              <InputWithLabel<UpdateFournisseurFormType>
                fieldTitle="Note google"
                nameInSchema="noteGoogle"
              />
              <InputWithLabel<UpdateFournisseurFormType>
                fieldTitle="Nombre d'avis google"
                nameInSchema="nbAvis"
              />
            </div>
            <Button
              variant="destructive"
              size="lg"
              title={tAdmin("mettre-a-jour")}
              className="mt-6 w-full text-base"
              disabled={isUpdatingFournisseur || loading}
            >
              {isUpdatingFournisseur || loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                tAdmin("mettre-a-jour")
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default FournisseurUpdateForm;
