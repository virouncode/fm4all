"use client";

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
import { toast } from "@/hooks/use-toast";
import { Link, useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth-client";
import { InsertAdminType } from "@/zod-schemas/admin";
import { createSignInSchema, SignInType } from "@/zod-schemas/signIn";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function SignIn() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations("auth");
  const tGlobal = useTranslations("Global");

  const defaultValues: SignInType = {
    email: "",
    password: "",
  };

  const form = useForm<SignInType>({
    mode: "onBlur",
    resolver: zodResolver(
      createSignInSchema({
        email: t("email-obligatoire"),
        emailInvalid: t("email-invalide"),
        password: t("mot-de-passe-obligatoire"),
      })
    ),
    defaultValues,
  });

  const submitForm = async (data: SignInType) => {
    await authClient.signIn.email(data, {
      onRequest: () => {
        setLoading(true);
      },
      onError: (ctx) => {
        console.log("ctx", ctx);
        if (ctx.error.status === 403) {
          toast({
            title: t("adresse-email-non-verifiee"),
            description: t(
              "un-nouveau-lien-de-verification-vient-de-vous-etre-envoye-merci-de-consulter-votre-boite-de-reception"
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
              "une-erreur-est-survenue-lors-de-la-connexion-veuillez-reessayer"
            ),
          variant: "destructive",
        });
      },
      onSuccess: async () => {
        router.push("/auth/redirect");
        router.refresh();
        toast({
          title: t("connexion-reussie"),
          description: t("vous-etes-maintenant-connecte"),
          variant: "default",
        });
      },
    });
    setLoading(false);
  };

  return (
    <main className="max-w-7xl h-[calc(100vh-4rem)] mx-auto py-4 px-6 md:px-20 relative md:static">
      <section className="flex items-center justify-center h-full">
        <BackgroundClient />
        <Card className="max-w-md w-full sm:w-1/2 lg:w-1/3">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">
              {t("connexion")}
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              {t("entrez-votre-email-et-mot-de-passe-pour-vous-connecter")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(submitForm)}>
                <div className="grid gap-4">
                  <InputWithLabel<InsertAdminType>
                    fieldTitle={t("email")}
                    nameInSchema="email"
                    type="email"
                  />
                  <InputWithLabel<InsertAdminType>
                    fieldTitle={t("mot-de-passe")}
                    nameInSchema="password"
                    type="password"
                  />
                  <Link
                    href="/auth/forgot-password"
                    className="underline text-sm"
                  >
                    {t("mot-de-passe-oublie")}
                  </Link>
                  <Button
                    className="w-full text-base"
                    disabled={loading || !form.formState.isValid}
                    variant="destructive"
                    size="lg"
                  >
                    {loading ? (
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
