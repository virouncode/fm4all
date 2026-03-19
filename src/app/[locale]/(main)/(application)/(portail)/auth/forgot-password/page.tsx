"use client";

import BackgroundClient from "@/components/backgrounds/BackgroundClient";
import { RhfInput } from "@/components/rhf/RhfInput";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { authClient } from "@/lib/auth/auth-client";
import {
  forgotPasswordSchema,
  ForgotPasswordType,
} from "@/zod-schemas/forgotPassword";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useForm, useFormState } from "react-hook-form";

export default function ForgotPassword() {
  const form = useForm<ForgotPasswordType>({
    mode: "onTouched",
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const { isSubmitting } = useFormState({ control: form.control });

  const submitForm = async (data: ForgotPasswordType) => {
    const { error } = await authClient.requestPasswordReset({
      email: data.email.toLowerCase(),
      redirectTo: "/auth/reset-password",
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(
        "Email envoyé !, si un compte existe avec cette adresse email, vous recevrez un lien de réinitialisation de mot de passe.",
      );
    }
  };

  return (
    <main className="mx-auto h-[calc(100vh-4rem)] max-w-7xl px-6 py-4 md:px-20">
      <section className="flex h-full items-center justify-center">
        <BackgroundClient />
        <Card className="z-10 w-sm">
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
                  <RhfInput<ForgotPasswordType>
                    name="email"
                    label="Email"
                    type="email"
                  />
                  <Button
                    className="w-full text-base"
                    disabled={isSubmitting}
                    size="lg"
                  >
                    {isSubmitting ? (
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
