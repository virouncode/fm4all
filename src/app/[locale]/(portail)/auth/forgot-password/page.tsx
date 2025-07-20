"use client";

import BackgroundClient from "@/components/backgrounds/BackgroundClient";
import { InputWithLabel } from "@/components/form-inputs/InputWithLabel";
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
import { useState } from "react";

import { useForm } from "react-hook-form";

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const defaultValues: ForgotPasswordType = {
    email: "",
  };
  const form = useForm<ForgotPasswordType>({
    mode: "all",
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
    <main className="mx-auto h-[calc(100vh-4rem)] max-w-7xl px-6 py-4 md:px-20">
      <section className="flex h-full items-center justify-center">
        <BackgroundClient />
        <Card className="z-10 max-w-md">
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
                    disabled={loading}
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
