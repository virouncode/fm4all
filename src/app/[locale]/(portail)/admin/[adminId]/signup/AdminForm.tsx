"use client";
import { insertAdminAction } from "@/actions/adminActions";
import { InputWithLabel } from "@/components/formInputs/InputWithLabel";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);

  const defaultValues: InsertAdminType = {
    prenom: "",
    nom: "",
    email: "",
    image: null,
  };
  const form = useForm<InsertAdminType>({
    mode: "onBlur",
    resolver: zodResolver(
      createInsertAdminSchema({
        email: tAuth("email-invalide"),
        prenom: tAdmin("prenom-obligatoire"),
        nom: tAdmin("nom-obligatoire"),
        image: tAdmin("image-invalide"),
      })
    ),
    defaultValues,
  });

  const {
    execute: executeSaveAdmin,
    isPending: isSavingAdmin,
    reset: resetSaveAdminAction,
  } = useAction(insertAdminAction, {
    onSuccess: ({ data }) => {
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
          error?.serverError ??
          tAdmin("une-erreur-est-survenue-lors-de-la-creation-de-lutilisateur"),
      });
    },
  });

  const submitForm = async (data: InsertAdminType) => {
    // executeSaveAdmin({ ...data, image: imagePreview });
    let imageUrl: string | null = null;
    if (image) {
      const response = await fetch(
        `/api/vercelblob/upload?filename=${data.prenom}_${data.nom}_avatar&foldername=admin_avatars`,
        {
          method: "POST",
          body: image,
        }
      );
      imageUrl = (await response.json()).url;
    }
    const adminToPost = {
      ...data,
      image: imageUrl,
    };
    executeSaveAdmin(adminToPost);
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
          <Button
            variant="destructive"
            size="lg"
            title={tAdmin("creer-un-compte")}
            className="text-base w-full mt-6"
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
