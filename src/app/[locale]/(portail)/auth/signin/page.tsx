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
import { useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth-client";
import { InsertAdminType } from "@/zod-schemas/admin";
import { signInSchema, SignInType } from "@/zod-schemas/signIn";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function SignIn() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const defaultValues: SignInType = {
    email: "",
    password: "",
  };

  const form = useForm<SignInType>({
    mode: "onBlur",
    resolver: zodResolver(signInSchema),
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
            title: "Adresse email non vérifiée 😿",
            description:
              "Un nouveau lien de vérification vient de vous être envoyé. Merci de consulter votre boîte de réception.",
            variant: "destructive",
          });
          return;
        }
        toast({
          title: "Erreur 😿",
          description:
            ctx.error.message ||
            "Une erreur est survenue lors de la connexion. Veuillez réessayer.",
          variant: "destructive",
        });
      },
      onSuccess: async () => {
        router.push("/auth/redirect");
      },
    });
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
            <CardTitle className="text-lg md:text-xl">Connexion</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Entrez votre email et mot de passe pour vous connecter
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(submitForm)}>
                <div className="grid gap-4">
                  <InputWithLabel<InsertAdminType>
                    fieldTitle="Email"
                    nameInSchema="email"
                    type="email"
                  />
                  <InputWithLabel<InsertAdminType>
                    fieldTitle="Mot de passe"
                    nameInSchema="password"
                    type="password"
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
