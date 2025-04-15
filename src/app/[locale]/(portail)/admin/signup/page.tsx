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
import Image from "next/image";
import { useState } from "react";
import AdminForm from "./AdminForm";
import ClientForm from "./ClientForm";
import FournisseurForm from "./FournisseurForm";

export type UserTypeType = "fournisseur" | "client" | "admin";

export default function SignUp() {
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
        <Card className="z-50 rounded-md  h-[85%]">
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
              {type === "fournisseur" && <FournisseurForm />}
              {type === "client" && <ClientForm />}
              {type === "admin" && <AdminForm />}

              {/* <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="first-name">Prénom</Label>
                  <Input
                    id="first-name"
                    placeholder="Max"
                    required
                    onChange={(e) => {
                      setFirstName(e.target.value);
                    }}
                    value={firstName}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="last-name">Nom</Label>
                  <Input
                    id="last-name"
                    required
                    onChange={(e) => {
                      setLastName(e.target.value);
                    }}
                    value={lastName}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@exemple.com"
                  required
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  value={email}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Confirmez votre mot de passe</Label>
                <Input
                  id="password_confirmation"
                  type="password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image">Profile Image (optional)</Label>
                <div className="flex items-end gap-4">
                  {imagePreview && (
                    <div className="relative w-16 h-16 rounded-sm overflow-hidden">
                      <Image
                        src={imagePreview}
                        alt="Profile preview"
                        layout="fill"
                        objectFit="cover"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2 w-full">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full"
                    />
                    {imagePreview && (
                      <X
                        className="cursor-pointer"
                        onClick={() => {
                          setImage(null);
                          setImagePreview(null);
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
                onClick={async () => {
                  await signUp.email({
                    name: `${firstName} ${lastName}`,
                    email,
                    password,
                    //@ts-expect-error better-auth does bug
                    role,
                    fournisseurId,
                    clientId,
                    image: image ? await convertImageToBase64(image) : "",
                    callbackURL: "/dashboard",
                    fetchOptions: {
                      onResponse: () => {
                        setLoading(false);
                      },
                      onRequest: () => {
                        setLoading(true);
                      },
                      onError: (ctx) => {
                        toast({
                          variant: "destructive",
                          title: "Error",
                          description: ctx.error.message,
                        });
                      },
                      onSuccess: async () => {
                        toast({
                          title: "Success",
                          description: "Account created successfully",
                        });
                      },
                    },
                  });
                }}
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Create an account"
                )}
              </Button> */}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

async function convertImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
