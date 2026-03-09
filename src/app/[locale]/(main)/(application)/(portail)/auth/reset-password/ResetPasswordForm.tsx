"use client";
import { RhfInput } from "@/components/rhf/RhfInput";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { PasswordStrengthIndicator } from "@/components/ui/password-strength-indicator";
import { useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth/auth-client";
import {
  ResetPasswordType,
  resetPasswordSchema,
} from "@/zod-schemas/resetPassword.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";

import { useForm } from "react-hook-form";
import { toast } from "sonner";

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
    mode: "all",
    resolver: zodResolver(resetPasswordSchema),
    defaultValues,
  });

  const submitForm = async (data: ResetPasswordType) => {
    if (data.password !== data.passwordConfirmation) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    const { error } = await authClient.resetPassword({
      newPassword: data.password,
      token,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(
        "Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion.",
      );
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    }
    setLoading(false);
  };
  const passwordValue = form.watch("password");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submitForm)}>
        <div className="grid gap-4">
          <div className="space-y-3">
            <RhfInput<ResetPasswordType>
              label="Nouveau mot de passe"
              name="password"
              type="password"
              autoComplete="new-password"
              requiredMark
            />
            <PasswordStrengthIndicator password={passwordValue} />
          </div>
          <RhfInput<ResetPasswordType>
            label="Confirmation mot de passe"
            name="passwordConfirmation"
            type="password"
            autoComplete="new-password"
            requiredMark
          />
          <Button className="w-full text-base" disabled={loading} size="lg">
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
