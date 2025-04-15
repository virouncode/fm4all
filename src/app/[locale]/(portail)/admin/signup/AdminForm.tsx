"use client";
import { InputWithLabel } from "@/components/formInputs/InputWithLabel";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { authClient } from "@/lib/auth-client";
import { capitalize } from "@/lib/capitalize";
import { insertAdminSchema, InsertAdminType } from "@/zod-schemas/admin";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";

const AdminForm = () => {
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
    resolver: zodResolver(insertAdminSchema),
    defaultValues,
  });
  // const {
  //   execute: executeSaveAdmin,
  //   isPending: isSavingAdmin,
  //   reset: resetSaveAdminAction,
  // } = useAction(insertAdminAction, {
  //   onSuccess: ({ data }) => {
  //     toast({
  //       variant: "default",
  //       title: "Success! 🎉",
  //       description: data?.message,
  //     });
  //     form.reset(defaultValues);
  //     resetSaveAdminAction();
  //     setImagePreview(null);
  //   },
  //   onError: ({ error }) => {
  //     toast({
  //       variant: "destructive",
  //       title: "Erreur 😿",
  //       description:
  //         error?.serverError ||
  //         "Une erreur est survenue lors de la création de l'utilisateur",
  //     });
  //   },
  // });
  const submitForm = async (data: InsertAdminType) => {
    // executeSaveAdmin({ ...data, image: imagePreview });
    if (data.password !== data.passwordConfirmation) {
      toast({
        variant: "destructive",
        title: "Erreur 😿",
        description: "Les mots de passe ne correspondent pas.",
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
          title: "Success! 🎉",
          description: `Le compte utilisateur de ${userToPost.name} a été crée avec succès, un email avec un lien de vérification a été envoyé à ${userToPost.email}`,
        });
        form.reset(defaultValues);
        // resetSaveAdminAction();
        setImage(null);
        setImagePreview(null);
      },
      onError: (ctx) => {
        toast({
          variant: "destructive",
          title: "Erreur 😿",
          description:
            ctx.error.message ??
            "Une erreur est survenue lors de la création de l'utilisateur",
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
        <form onSubmit={form.handleSubmit(submitForm)}>
          <div className="grid grid-cols-2 gap-6">
            <InputWithLabel<InsertAdminType>
              fieldTitle="Email*"
              nameInSchema="email"
              type="email"
            />
            <div className="flex flex-col gap-2">
              <Label htmlFor="image" className="text-base">
                Avatar
              </Label>
              <div className="flex items-end gap-4 relative">
                {imagePreview ? (
                  <div className="flex items-center gap-4 w-full justify-center absolute -top-6">
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
                      className="className={`w-full max-w-xs disabled:text-blue-500 dark:disabled:text-yellow-300 disabled:opacity-75"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <InputWithLabel<InsertAdminType>
              fieldTitle="Prénom*"
              nameInSchema="prenom"
            />
            <InputWithLabel<InsertAdminType>
              fieldTitle="Nom*"
              nameInSchema="nom"
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <InputWithLabel<InsertAdminType>
              fieldTitle="Mot de passe*"
              nameInSchema="password"
              type="password"
            />
            <InputWithLabel<InsertAdminType>
              fieldTitle="Confirmation mot de passe*"
              nameInSchema="passwordConfirmation"
              type="password"
            />
          </div>

          <div className="flex justify-center mt-6">
            <Button
              variant="destructive"
              size="lg"
              title="Créer un compte"
              className="text-base"
              disabled={!form.formState.isValid || loading}
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Créer un compte"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

export default AdminForm;

async function convertImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
