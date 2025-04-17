"use client";
import { InputWithLabel } from "@/components/formInputs/InputWithLabel";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { authClient } from "@/lib/auth-client";
import { capitalize } from "@/lib/capitalize";
import { createInsertAdminSchema, InsertAdminType } from "@/zod-schemas/admin";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";

const AdminForm = () => {
  const tAdmin = useTranslations("admin");
  const tAuth = useTranslations("auth");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const defaultValues: InsertAdminType = {
    prenom: "",
    nom: "",
    email: "",
    password: "",
    passwordConfirmation: "",
    image: null,
    role: "admin",
  };
  const form = useForm<InsertAdminType>({
    mode: "onBlur",
    resolver: zodResolver(
      createInsertAdminSchema({
        email: tAuth("email-invalide"),
        prenom: tAdmin("prenom-obligatoire"),
        nom: tAdmin("nom-obligatoire"),
        password: tAuth("mot-de-passe-obligatoire"),
        passwordConfirmation: tAdmin(
          "confirmation-du-mot-de-passe-obligatoire"
        ),
      })
    ),
    defaultValues,
  });

  const submitForm = async (data: InsertAdminType) => {
    // executeSaveAdmin({ ...data, image: imagePreview });
    if (data.password !== data.passwordConfirmation) {
      toast({
        variant: "destructive",
        title: tAuth("erreur"),
        description: tAuth("les-mots-de-passe-ne-correspondent-pas"),
      });
      return;
    }
    const response = await fetch(
      `/api/vercelblob/upload?filename=${data.prenom}_${data.nom}_avatar&foldername=admin_avatars`,
      {
        method: "POST",
        body: image,
      }
    );
    const imageUrl: string = (await response.json()).url;
    const userToPost = {
      name: capitalize(data.prenom) + " " + capitalize(data.nom),
      email: data.email.toLowerCase(),
      password: data.password,
      role: "admin",
      image: imageUrl,
    };
    await authClient.signUp.email(userToPost, {
      onRequest: () => {
        setLoading(true);
      },
      onSuccess: () => {
        toast({
          variant: "default",
          title: tAuth("succes"),
          description: tAdmin(
            "le-compte-utilisateur-de-usertopost-name-a-ete-cree-avec-succes-un-email-avec-un-lien-de-verification-a-ete-envoye-a-usertopost-email",
            { userName: userToPost.name, userEmail: userToPost.email }
          ),
        });
        form.reset(defaultValues);
        // resetSaveAdminAction();
        setImage(null);
        setImagePreview(null);
      },
      onError: (ctx) => {
        toast({
          variant: "destructive",
          title: tAuth("erreur"),
          description:
            ctx.error.message ??
            tAdmin(
              "une-erreur-est-survenue-lors-de-la-creation-de-lutilisateur"
            ),
        });
      },
    });
    setLoading(false);
  };
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
  return (
    <>
      {/* <DisplayServerActionResponse result={resultSaveAdmin} /> */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(submitForm)} className="grid gap-2">
          <div className="grid md:grid-cols-2 gap-2 md:gap-6">
            <InputWithLabel<InsertAdminType>
              fieldTitle="Email*"
              nameInSchema="email"
              type="email"
            />
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="image"
                className={`text-base ${imagePreview ? "mb-6" : ""} `}
              >
                Avatar
              </Label>
              <div className="flex items-end gap-4 relative">
                {imagePreview ? (
                  <div className="flex items-center gap-4 w-full justify-center absolute -top-20 md:-top-6">
                    <div className="relative rounded-full w-20 h-20 overflow-hidden">
                      <Image
                        src={imagePreview}
                        alt="avatar preview"
                        fill={true}
                        className="object-cover object-center"
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
                ) : (
                  <div className="flex items-center gap-2 w-full">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="className={`w-full max-w-xs disabled:text-blue-500 dark:disabled:text-yellow-300 disabled:opacity-75 mb-6"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-2 md:gap-6">
            <InputWithLabel<InsertAdminType>
              fieldTitle={tAdmin("prenom")}
              nameInSchema="prenom"
            />
            <InputWithLabel<InsertAdminType>
              fieldTitle={tAdmin("nom")}
              nameInSchema="nom"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-2 md:gap-6">
            <InputWithLabel<InsertAdminType>
              fieldTitle={tAdmin("mot-de-passe")}
              nameInSchema="password"
              type="password"
            />
            <InputWithLabel<InsertAdminType>
              fieldTitle={tAdmin("confirmation-mot-de-passe")}
              nameInSchema="passwordConfirmation"
              type="password"
            />
          </div>

          <Button
            variant="destructive"
            size="lg"
            title={tAdmin("creer-un-compte")}
            className="text-base w-full mt-6"
            disabled={loading}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              tAdmin("creer-un-compte")
            )}
          </Button>
        </form>
      </Form>
    </>
  );
};

export default AdminForm;
