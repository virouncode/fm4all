"use client";

import BackgroundClient from "@/components/BackgroundClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SelectClientType } from "@/zod-schemas/client";
import { SelectFournisseurType } from "@/zod-schemas/fournisseur";
import { useTranslations } from "next-intl";
import { useState } from "react";
import AdminForm from "./AdminForm";
import ClientForm from "./ClientForm";
import FournisseurForm from "./FournisseurForm";

export type UserTypeType = "fournisseur" | "client" | "admin";

type SignUpProps = {
  fournisseurs?: SelectFournisseurType[];
  clients?: SelectClientType[];
};

export default function SignUp({ fournisseurs, clients }: SignUpProps) {
  const [type, setType] = useState<UserTypeType>("fournisseur");
  const t = useTranslations("admin");

  return (
    <main className="max-w-7xl md:h-[calc(100vh-4rem)] mx-auto py-4 px-6 md:px-20 relative md:static">
      <section className="flex items-center justify-center h-full">
        <BackgroundClient />
        <Card className="rounded-md h-[90%] w-full sm:w-3/4 md:w-2/3 overflow-y-auto">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">
              {t("creer-un-compte-utilisateur")}
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              {t(
                "choisissez-votre-type-de-compte-et-remplissez-les-informations-necessaires"
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="flex flex-col md:flex-row gap-4 md:items-center">
                <Label htmlFor="type" className="text-base">
                  {t("type-de-compte")}
                </Label>
                <RadioGroup
                  onValueChange={(value) => setType(value as UserTypeType)}
                  value={type}
                  className="flex gap-6 items-center"
                  name="type"
                >
                  <div className="flex gap-2 items-center">
                    <RadioGroupItem
                      value="fournisseur"
                      title={t("fournisseur")}
                      id="fournisseur"
                    />
                    <Label htmlFor="fournisseur">{t("fournisseur")}</Label>
                  </div>
                  <div className="flex gap-2 items-center">
                    <RadioGroupItem
                      value="client"
                      title={t("client")}
                      id="client"
                    />
                    <Label htmlFor="client">{t("client")}</Label>
                  </div>
                  <div className="flex gap-2 items-center">
                    <RadioGroupItem
                      value="admin"
                      title={t("admin")}
                      id="admin"
                    />
                    <Label htmlFor="admin">{t("admin")}</Label>
                  </div>
                </RadioGroup>
              </div>
              {type === "fournisseur" && (
                <FournisseurForm fournisseurs={fournisseurs} />
              )}
              {type === "client" && <ClientForm clients={clients} />}
              {type === "admin" && <AdminForm />}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
