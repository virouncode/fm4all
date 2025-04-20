"use client";

import { updateAdminAction } from "@/actions/adminActions";
import BackgroundClient from "@/components/BackgroundClient";
import { InputWithLabel } from "@/components/formInputs/InputWithLabel";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { createUpdateAdminSchema, UpdateAdminType } from "@/zod-schemas/admin";
import { SelectUserType } from "@/zod-schemas/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAction } from "next-safe-action/hooks";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";

type AdminInfoProps = {
  info: SelectUserType;
};

const AdminInfo = ({ info }: AdminInfoProps) => {
  const tAuth = useTranslations("auth");
  const tAdmin = useTranslations("admin");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(info.image);
  const defaultValues: UpdateAdminType = {
    id: info.id,
    prenom: info.name.split(" ")[0],
    nom: info.name.split(" ")[1],
    image: info.image,
  };
  const form = useForm<UpdateAdminType>({
    mode: "onBlur",
    resolver: zodResolver(
      createUpdateAdminSchema({
        id: tAdmin("id-de-ladministrateur-invalide"),
        prenom: tAdmin("prenom-obligatoire"),
        nom: tAdmin("nom-obligatoire"),
        image: tAdmin("image-invalide"),
      })
    ),
    defaultValues,
  });

  const {
    execute: executeUpdateAdmin,
    isPending: isUpdatingAdmin,
    reset: resetUpdateAdminAction,
  } = useAction(updateAdminAction, {
    onSuccess: ({ data }) => {
      toast({
        variant: "default",
        title: tAuth("succes"),
        description: data?.message,
      });
      resetUpdateAdminAction();
    },
    onError: ({ error }) => {
      toast({
        variant: "destructive",
        title: tAuth("erreur"),
        description:
          error?.serverError ??
          tAdmin(
            "une-erreur-est-survenue-lors-de-la-mise-a-jour-de-lutilisateur"
          ),
      });
    },
  });

  const submitForm = async (data: UpdateAdminType) => {
    let imageUrl: string | null = null;
    console.log("submit");

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
    const adminToUpdate = {
      ...data,
      image: imageUrl,
    };
    executeUpdateAdmin(adminToUpdate);
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
    <main className="max-w-7xl min-h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)] mx-auto py-4 px-6 md:px-20 relative md:static">
      <section className="flex items-center justify-center min-h-[calc(95vh-4rem)] md:h-full">
        <BackgroundClient />
        <Card className="rounded-md h-[60%] w-full sm:w-3/4 md:w-2/3 overflow-y-auto">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">
              {tAdmin("mes-informations")}
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              {tAdmin("mettez-a-jour-vos-informations-personnelles")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(submitForm)}
                className="grid gap-2"
              >
                <div className="grid md:grid-cols-2 gap-2 md:gap-6">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="email" className="text-base">
                      Email*
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      className="w-full max-w-xs disabled:text-blue-500 dark:disabled:text-yellow-300 disabled:opacity-75 read-only:pointer-events-none read-only:text-slate-400"
                      value={info.email}
                      readOnly={true}
                    />
                    <div className="h-[19px] opacity-0" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="image"
                      className={`text-base ${imagePreview ? "mb-6" : ""} `}
                    >
                      Avatar
                    </Label>
                    <div className="flex items-end gap-4 relative">
                      {imagePreview ? (
                        <div className="flex items-center gap-4 w-full justify-center absolute -top-20 md:-top-12">
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
                  <InputWithLabel<UpdateAdminType>
                    fieldTitle={tAdmin("prenom")}
                    nameInSchema="prenom"
                  />
                  <InputWithLabel<UpdateAdminType>
                    fieldTitle={tAdmin("nom")}
                    nameInSchema="nom"
                  />
                </div>
                <Button
                  variant="destructive"
                  size="lg"
                  title={tAdmin("mettre-a-jour")}
                  className="text-base w-full mt-6"
                  disabled={isUpdatingAdmin}
                >
                  {isUpdatingAdmin ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    tAdmin("mettre-a-jour")
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default AdminInfo;
