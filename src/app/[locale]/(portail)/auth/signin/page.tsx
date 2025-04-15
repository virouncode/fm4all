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
import { signIn } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
            <CardTitle className="text-lg md:text-xl">Login</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Entrez votre email et mot de passe pour vous connecter
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
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
                <div className="flex items-center">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Link
                    href="#"
                    className="ml-auto inline-block text-sm underline"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>

                <Input
                  id="password"
                  type="password"
                  placeholder="Mot de passe"
                  autoComplete="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
                onClick={async () => {
                  const { data, error } = await signIn.email(
                    {
                      email,
                      password,
                    },
                    {
                      onRequest: (ctx) => {
                        setLoading(true);
                      },
                      onResponse: (ctx) => {
                        setLoading(false);
                      },
                      onError: (ctx) => {
                        if (ctx.error.status === 403) {
                          alert("Please verify your email address");
                        }
                      },
                      onSuccess: async (ctx) => {
                        router.push("/auth/redirect");
                      },
                    }
                  );

                  if (error) {
                    toast({
                      title: "Error",
                      description: error.message,
                      variant: "destructive",
                    });
                  }
                }}
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Login"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
