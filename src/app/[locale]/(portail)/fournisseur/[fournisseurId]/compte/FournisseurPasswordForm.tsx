"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

const FournisseurPasswordForm = () => {
  const tAdmin = useTranslations("admin");
  const tAuth = useTranslations("auth");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    newPasswordConfirm: "",
  });
  const router = useRouter();

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (formData.newPassword !== formData.newPasswordConfirm) {
      toast({
        variant: "destructive",
        title: tAuth("erreur"),
        description: "Les nouveaux mots de passe ne correspondent pas.",
      });
      setLoading(false);
      return;
    }
    try {
      const { error } = await authClient.changePassword({
        newPassword: formData.newPassword,
        currentPassword: formData.currentPassword,
        revokeOtherSessions: true,
      });
      if (error) {
        toast({
          variant: "destructive",
          title: tAuth("erreur"),
          description:
            "Une erreur est survenue lors du changement de mot de passe: " +
            error.message,
        });
      } else {
        toast({
          title: tAuth("succes"),
          description:
            "Votre mot de passe a été modifié avec succès. Veuillez vous reconnecter.",
        });
        await authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              router.push("/auth/signin");
            },
          },
        });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast({
        variant: "destructive",
        title: tAuth("erreur"),
        description:
          "Une erreur est survenue lors du changement de mot de passe: " +
          (error instanceof Error ? error.message : "Erreur inconnue"),
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <Card className="rounded-md h-[60%] w-full sm:w-3/4 lg:w-2/3 mx-auto">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">
          <p>Mot de passe</p>
        </CardTitle>
        <CardDescription className="text-sm md:text-base  italic">
          👉 Changez votre mot de passe
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-2" onSubmit={handleSubmit}>
          <div className="flex flex-col md:grid md:grid-cols-2 gap-2 md:gap-6">
            <Label htmlFor="currentPassword" className="text-base">
              Mot de passe actuel*
            </Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={handleChange}
            />
          </div>
          <div className="flex flex-col md:grid md:grid-cols-2 gap-2 md:gap-6">
            <Label htmlFor="newPassword" className="text-base">
              Nouveau mot de passe*
            </Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={handleChange}
            />
          </div>
          <div className="flex flex-col md:grid md:grid-cols-2 gap-2 md:gap-6">
            <Label htmlFor="newPasswordConfirm" className="text-base">
              Confirmation du nouveau mot de passe*
            </Label>
            <Input
              id="newPasswordConfirm"
              name="newPasswordConfirm"
              type="password"
              value={formData.newPasswordConfirm}
              onChange={handleChange}
            />
          </div>
          <Button
            variant="destructive"
            size="lg"
            title={tAdmin("mettre-a-jour")}
            className="text-base w-full mt-6"
            disabled={loading}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              tAdmin("mettre-a-jour")
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FournisseurPasswordForm;
