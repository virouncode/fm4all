"use client";

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
import Image from "next/image";
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

  return (
    <main className="max-w-7xl h-[calc(100vh-4rem)] mx-auto py-4 px-6 md:px-20">
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
        <Card className="z-50 rounded-md  h-[90%] w-2/3 overflow-y-auto">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">
              Créer un compte utilisateur
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Choisissez votre type de compte et remplissez les informations
              nécessaires.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="flex gap-4 items-center">
                <Label htmlFor="type" className="text-base">
                  Type de compte :
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
                      title="Fournisseur"
                      id="fournisseur"
                    />
                    <Label htmlFor="fournisseur">Fournisseur</Label>
                  </div>
                  <div className="flex gap-2 items-center">
                    <RadioGroupItem value="client" title="Client" id="client" />
                    <Label htmlFor="client">Client</Label>
                  </div>
                  <div className="flex gap-2 items-center">
                    <RadioGroupItem value="admin" title="Admin" id="admin" />
                    <Label htmlFor="admin">Admin</Label>
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
