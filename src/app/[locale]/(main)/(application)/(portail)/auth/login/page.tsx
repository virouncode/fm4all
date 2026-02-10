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
import { Link, useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { createSignInSchema, SignInType } from "@/zod-schemas/signIn";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm, useFormState } from "react-hook-form";

export default function SignIn() {
  const router = useRouter();
  const t = useTranslations("auth");

  const defaultValues: SignInType = {
    email: "",
    password: "",
  };

  const form = useForm<SignInType>({
    mode: "all",
    resolver: zodResolver(
      createSignInSchema({
        email: t("email-obligatoire"),
        emailInvalid: t("email-invalide"),
        password: t("mot-de-passe-obligatoire"),
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
          toast({
            title: t("adresse-email-non-verifiee"),
            description: t(
              "un-nouveau-lien-de-verification-vient-de-vous-etre-envoye-merci-de-consulter-votre-boite-de-reception",
            ),
            variant: "destructive",
          });
          return;
        }
        toast({
          title: t("erreur"),
          description:
            ctx.error.message ||
            t(
              "une-erreur-est-survenue-lors-de-la-connexion-veuillez-reessayer",
            ),
          variant: "destructive",
        });
      },
      onSuccess: async () => {
        router.push("/app");
        router.refresh();
        toast({
          title: t("connexion-reussie"),
          description: t("vous-etes-maintenant-connecte"),
          variant: "default",
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
            <CardTitle className="text-lg md:text-xl">
              {t("connexion")}
            </CardTitle>
            <CardDescription className="w-full text-xs md:text-sm">
              {t("entrez-votre-email-et-mot-de-passe-pour-vous-connecter")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={handleSubmit(submitForm)}>
                <div className="grid gap-4">
                  <InputWithLabel<SignInType>
                    fieldTitle={t("email")}
                    nameInSchema="email"
                    type="email"
                  />
                  <InputWithLabel<SignInType>
                    fieldTitle={t("mot-de-passe")}
                    nameInSchema="password"
                    type="password"
                  />
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm underline"
                  >
                    {t("mot-de-passe-oublie")}
                  </Link>
                  <Button
                    className="w-full text-base"
                    disabled={isSubmitting}
                    size="lg"
                  >
                    {isSubmitting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      t("connexion")
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
