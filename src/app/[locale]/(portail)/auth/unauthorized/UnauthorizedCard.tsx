"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";

type UnauthorizedCardProps = {
  type: string | null;
};

const UnauthorizedCard = ({ type }: UnauthorizedCardProps) => {
  return (
    <Card className="max-w-md z-20">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl text-red-600">
          Page non autorisée
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Vous n&apos;avez pas les droits d&apos;accès à cette page . Veuillez
          vous connecter avec un compte <strong>{type ?? ""}</strong> valide.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-center">
          <Link href="/auth/signin" className="underline">
            Me connecter
          </Link>
        </p>
      </CardContent>
    </Card>
  );
};

export default UnauthorizedCard;
