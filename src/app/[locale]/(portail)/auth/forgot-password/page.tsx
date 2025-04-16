"use client";

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
import { toast } from "@/hooks/use-toast";
import { authClient } from "@/lib/auth-client";
import {
  forgotPasswordSchema,
  ForgotPasswordType,
} from "@/zod-schemas/forgotPassword";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { useForm } from "react-hook-form";

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const defaultValues: ForgotPasswordType = {
    email: "",
  };
  const form = useForm<ForgotPasswordType>({
    mode: "onBlur",
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues,
  });

  const submitForm = async (data: ForgotPasswordType) => {
    setLoading(true);
    const { error } = await authClient.forgetPassword({
      email: data.email.toLowerCase(),
      redirectTo: "/auth/reset-password",
    });
    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur 😿",
        description: error.message,
      });
    } else {
      toast({
        title: "Email envoyé !",
        description:
          "Si un compte existe avec cette adresse email, vous recevrez un lien de réinitialisation de mot de passe.",
      });
    }
    setLoading(false);
  };

  return (
    <main className="max-w-7xl h-[calc(100vh-4rem)] mx-auto  py-4 px-6 md:px-20">
      <section className="flex items-center justify-center h-full">
        <div className="absolute inset-0 z-0">
          <Image
            src={"/img/hero_wallpaper_compressed.webp"}
            alt="une image de bureaux modernes et lumineux avec des plantes vertes"
            className="object-cover"
            quality={75}
            priority
            fill
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40"></div>
        </div>
        <Card className="max-w-md z-10">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">
              Mot de passe oublié
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Entrez votre email pour recevoir un lien de réinitialisation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(submitForm)}>
                <div className="grid gap-4">
                  <InputWithLabel<ForgotPasswordType>
                    fieldTitle="Email"
                    nameInSchema="email"
                    type="email"
                  />
                  <Button
                    className="w-full text-base"
                    disabled={loading || !form.formState.isValid}
                    variant="destructive"
                    size="lg"
                  >
                    {loading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      "Envoyer le lien"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
