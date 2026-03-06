"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getPresignedReadUrl } from "@/lib/s3/upload-helper";
import { useEffect, useState } from "react";

type LogoAvatarProps = {
  storageKey: string | null;
  proprietaireEntrepriseId: string;
  nom: string;
  /** "sm" = h-8 w-8 (table row), "md" = h-10 w-10 (card) */
  size?: "sm" | "md";
};

export function LogoAvatar({
  storageKey,
  proprietaireEntrepriseId,
  nom,
  size = "md",
}: LogoAvatarProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!storageKey) return;

    getPresignedReadUrl({ key: storageKey, proprietaireEntrepriseId })
      .then(setLogoUrl)
      .catch(() => setLogoUrl(null));
  }, [storageKey, proprietaireEntrepriseId]);

  const initial = nom.charAt(0).toUpperCase();
  const sizeClass = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const textClass =
    size === "sm" ? "text-sm font-semibold" : "text-base font-bold";

  return (
    <Avatar className={`${sizeClass} flex-shrink-0 ring-1 ring-border`}>
      {logoUrl && <AvatarImage src={logoUrl} alt={`Logo ${nom}`} className="object-contain" />}
      <AvatarFallback className={`${textClass} bg-primary/10 text-primary`}>
        {initial}
      </AvatarFallback>
    </Avatar>
  );
}
