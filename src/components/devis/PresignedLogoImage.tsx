"use client";

import { getPresignedDevisImageReadUrlAction } from "@/server/actions/s3Actions";
import Image from "next/image";
import { useEffect, useState } from "react";

type PresignedLogoImageProps = {
  storageKey: string | null;
  alt: string;
  className?: string;
  sizes?: string;
};

const isDirectUrl = (key: string) =>
  key.startsWith("/") || key.startsWith("http");

const PresignedLogoImage = ({
  storageKey,
  alt,
  className = "object-contain",
  sizes = "(min-width:768px) 33vw",
}: PresignedLogoImageProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(
    storageKey && isDirectUrl(storageKey) ? storageKey : null,
  );

  useEffect(() => {
    if (!storageKey || isDirectUrl(storageKey)) return;
    getPresignedDevisImageReadUrlAction({ key: storageKey, expiresIn: 3600 }).then((result) => {
      if (result?.data?.url) {
        setImageUrl(result.data.url);
      }
    });
  }, [storageKey]);

  if (!imageUrl) return null;

  return (
    <Image
      src={imageUrl}
      alt={alt}
      fill
      className={className}
      sizes={sizes}
    />
  );
};

export default PresignedLogoImage;
