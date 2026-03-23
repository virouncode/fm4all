"use client";

import { getPresignedDevisImageReadUrlAction } from "@/server/actions/s3Actions";
import Image from "next/image";
import { useEffect, useState } from "react";

type PresignedTarifImageProps = {
  storageKey: string | null;
  fallbackSrc: string;
  alt: string;
  sizes?: string;
};

const PresignedTarifImage = ({
  storageKey,
  fallbackSrc,
  alt,
  sizes = "(min-width:768px) 33vw",
}: PresignedTarifImageProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!storageKey) return;
    getPresignedDevisImageReadUrlAction({ key: storageKey }).then((result) => {
      if (result?.data?.url) {
        setImageUrl(result.data.url);
      }
    });
  }, [storageKey]);

  return (
    <Image
      src={imageUrl ?? fallbackSrc}
      alt={alt}
      fill
      className="object-contain"
      sizes={sizes}
    />
  );
};

export default PresignedTarifImage;
