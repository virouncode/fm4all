"use client";
import { InputWithLabel } from "@/components/formInputs/InputWithLabel";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth-client";
import {
  ResetPasswordType,
  resetPasswordSchema,
} from "@/zod-schemas/resetPassword";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";

import { useForm } from "react-hook-form";

type ResetPasswordProps = {
  token: string;
};

const ResetPasswordForm = ({ token }: ResetPasswordProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const defaultValues = {
    password: "",
    passwordConfirmation: "",
  };

  const form = useForm<ResetPasswordType>({
    mode: "onBlur",
    resolver: zodResolver(resetPasswordSchema),
    defaultValues,
  });

  const submitForm = async (data: ResetPasswordType) => {
    if (data.password !== data.passwordConfirmation) {
      toast({
        variant: "destructive",
        title: "Erreur 😿",
        description: "Les mots de passe ne correspondent pas.",
      });
      return;
    }
    setLoading(true);
    const { error } = await authClient.resetPassword({
      newPassword: data.password,
      token,
    });
    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur 😿",
        description: error.message,
      });
    } else {
      toast({
        variant: "default",
        title: "Succès ! 🎉",
        description:
          "Votre mot de passe a été réinitialisé avec succès. Vous aller être redirigé vers la page de connexion.",
      });
      setTimeout(() => {
        router.push("/auth/signin");
      }, 2000);
    }
    setLoading(false);
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submitForm)}>
        <div className="grid gap-4">
          <InputWithLabel<ResetPasswordType>
            fieldTitle="Nouveau mot de passe*"
            nameInSchema="password"
            type="password"
          />
          <InputWithLabel<ResetPasswordType>
            fieldTitle="Confirmation mot de passe*"
            nameInSchema="passwordConfirmation"
            type="password"
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
              "Enregistrer"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ResetPasswordForm;
