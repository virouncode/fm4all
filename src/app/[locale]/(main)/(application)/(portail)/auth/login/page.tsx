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
import { Link, useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { createSignInSchema, SignInType } from "@/zod-schemas/signIn";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm, useFormState } from "react-hook-form";
import { toast } from "sonner";

const defaultValues: SignInType = {
  email: "",
  password: "",
};

export default function SignIn() {
  const router = useRouter();

  const form = useForm<SignInType>({
    mode: "all",
    resolver: zodResolver(
      createSignInSchema({
        email: "Email obligatoire",
        emailInvalid: "Email invalide",
        password: "Mot de passe obligatoire",
      }),
    ),
    defaultValues,
  });

  const { handleSubmit } = form;
  const { isSubmitting } = useFormState({ control: form.control });

  const submitForm = async (data: SignInType) => {
    await authClient.signIn.email(data, {
      onError: (ctx) => {
        if (ctx.error.status === 403) {
          toast.error("Adresse email non vérifiée", {
            description:
              "Un nouveau lien de vérification vient de vous être envoyé. Merci de consulter votre boîte de réception.",
          });
          return;
        }
        if (ctx.error.status === 401) {
          toast.error("Identifiants incorrects", {
            description: "Email ou mot de passe invalide.",
          });
          return;
        }
        if (ctx.error.status === 400) {
          toast.error("Email invalide", {
            description: "Veuillez saisir une adresse email valide.",
          });
          return;
        }
        toast.error("Erreur de connexion", {
          description:
            "Une erreur est survenue lors de la connexion. Veuillez réessayer.",
        });
      },
      onSuccess: async () => {
        router.push("/app");
        router.refresh();
        toast.success("Connexion réussie", {
          description: "Vous êtes maintenant connecté.",
        });
      },
    });
  };

  return (
    <main className="relative mx-auto h-[calc(100vh-4rem)] max-w-7xl px-6 py-4 md:static md:px-20">
      <section className="flex h-full items-center justify-center">
        <BackgroundClient />
        <Card className="w-sm">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Connexion</CardTitle>
            <CardDescription className="w-full text-xs md:text-sm">
              Entrez votre email et mot de passe pour vous connecter
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={handleSubmit(submitForm)}>
                <div className="grid gap-4">
                  <RhfInput<SignInType>
                    label="Email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    requiredMark
                  />
                  <RhfInput<SignInType>
                    label="Mot de passe"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    requiredMark
                  />
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm underline"
                  >
                    Mot de passe oublié ?
                  </Link>
                  <Button
                    className="w-full text-base"
                    disabled={isSubmitting}
                    size="lg"
                  >
                    {isSubmitting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      "Connexion"
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
