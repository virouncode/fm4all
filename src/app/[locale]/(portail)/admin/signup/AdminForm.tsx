"use client";
import { insertAdminAction } from "@/actions/insertAdminAction";
import { InputWithLabel } from "@/components/formInputs/InputWithLabel";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { insertAdminSchema, InsertAdminType } from "@/zod-schemas/admin";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";

const AdminForm = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);

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
  const {
    execute: executeSaveAdmin,
    isPending: isSavingAdmin,
    reset: resetSaveAdminAction,
  } = useAction(insertAdminAction, {
    onSuccess: ({ data }) => {
      toast({
        variant: "default",
        title: "Success! 🎉",
        description: data?.message,
      });
      form.reset(defaultValues);
      resetSaveAdminAction();
    },
    onError: ({ error }) => {
      toast({
        variant: "destructive",
        title: "Erreur 😿",
        description:
          error?.serverError ||
          "Une erreur est survenue lors de la création de l'utilisateur",
      });
    },
  });
  const submitForm = async (data: InsertAdminType) => {
    executeSaveAdmin({ ...data, image: imagePreview });
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
              disabled={!form.formState.isValid || isSavingAdmin}
            >
              {isSavingAdmin ? (
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
