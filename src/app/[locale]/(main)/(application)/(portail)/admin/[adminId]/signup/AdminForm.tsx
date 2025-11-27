"use client";
import { insertAdminAction } from "@/actions/adminActions";
import { InputWithLabel } from "@/components/form-inputs/InputWithLabel";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { postVercelBlob } from "@/lib/queries/vercel-blob/postVercelBlob";
import { createInsertAdminSchema, InsertAdminType } from "@/zod-schemas/admin";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAction } from "next-safe-action/hooks";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";

const AdminForm = () => {
  const tAdmin = useTranslations("admin");
  const tAuth = useTranslations("auth");
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);

  const defaultValues: InsertAdminType = {
    prenom: "",
    nom: "",
    email: "",
    image: null,
  };
  const form = useForm<InsertAdminType>({
    mode: "all",
    resolver: zodResolver(
      createInsertAdminSchema({
        email: tAuth("email-invalide"),
        prenom: tAdmin("prenom-obligatoire"),
        nom: tAdmin("nom-obligatoire"),
        image: tAdmin("image-invalide"),
      }),
    ),
    defaultValues,
  });

  const {
    execute: executeSaveAdmin,
    isPending: isSavingAdmin,
    reset: resetSaveAdminAction,
  } = useAction(insertAdminAction, {
    onSuccess: ({ data }) => {
      if (!data?.success) {
        return toast({
          variant: "destructive",
          title: tAuth("erreur"),
          description: data?.message,
        });
      }
      toast({
        variant: "default",
        title: tAuth("succes"),
        description: data?.message,
      });
      form.reset(defaultValues);
      resetSaveAdminAction();
      setImage(null);
      setImagePreview(null);
    },
    onError: ({ error }) => {
      toast({
        variant: "destructive",
        title: tAuth("erreur"),
        description:
          error?.serverError ?? //le message d'erreur custom depuis handleServerError dans safe-actions.ts
          tAdmin("une-erreur-est-survenue-lors-de-la-creation-de-lutilisateur"),
      });
    },
  });

  const submitForm = async (data: InsertAdminType) => {
    // executeSaveAdmin({ ...data, image: imagePreview });
    let imageUrl: string | null = null;
    setLoading(true);
    if (image) {
      const response = await postVercelBlob({
        file: image,
        filename: `${data.prenom}_${data.nom}_avatar`,
        foldername: "admin_avatars",
      });
      imageUrl = response.url;
    }
    const adminToPost: InsertAdminType = {
      ...data,
      image: imageUrl,
    };
    executeSaveAdmin(adminToPost);
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
          <div className="grid gap-2 md:grid-cols-2 md:gap-6">
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
              <div className="relative flex items-end gap-4">
                {imagePreview ? (
                  <div className="absolute -top-20 flex w-full items-center justify-center gap-4 md:-top-6">
                    <div className="relative h-20 w-20 overflow-hidden rounded-full">
                      <Image
                        src={imagePreview}
                        alt="avatar preview"
                        fill
                        className="object-cover object-center"
                        sizes="80px"
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
                  <div className="flex w-full items-center gap-2">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="className={`w-full mb-6 max-w-xs disabled:text-blue-500 disabled:opacity-75 dark:disabled:text-yellow-300"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="grid gap-2 md:grid-cols-2 md:gap-6">
            <InputWithLabel<InsertAdminType>
              fieldTitle={tAdmin("prenom")}
              nameInSchema="prenom"
            />
            <InputWithLabel<InsertAdminType>
              fieldTitle={tAdmin("nom")}
              nameInSchema="nom"
            />
          </div>
          <Button
            variant="destructive"
            size="lg"
            title={tAdmin("creer-un-compte")}
            className="mt-6 w-full text-base"
            disabled={isSavingAdmin}
          >
            {isSavingAdmin ? (
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
