"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "@/i18n/navigation";
import { useEffect } from "react";

const EmailOkCard = () => {
  const router = useRouter();
  useEffect(() => {
    // Redirection après 5 secondes (5000 ms)
    const timer = setTimeout(async () => {
      router.push("/auth/signin");
    }, 5000);

    // Nettoyage du timer si le composant est démonté
    return () => clearTimeout(timer);
  }, [router]);
  return (
    <Card className="max-w-md z-20">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">
          Adresse email vérifiée ! Merci.
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Votre adresse email a été vérifiée avec succès.
        </CardDescription>
      </CardHeader>
      <CardContent>
        Vous allez être redirigé vers la page de connexion dans quelques
        secondes.
      </CardContent>
    </Card>
  );
};

export default EmailOkCard;
