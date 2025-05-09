"use client";
import { useTranslations } from "next-intl";
import Image from "next/image";

const BackgroundClient = () => {
  const tGlobal = useTranslations("Global");
  return (
    <div className="absolute inset-0 -z-10">
      <Image
        src={"/img/hero_wallpaper_compressed.webp"}
        alt={tGlobal(
          "une-image-de-bureaux-modernes-et-lumineux-avec-des-plantes-vertes"
        )}
        className="object-cover"
        quality={75}
        priority
        fill
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40"></div>
    </div>
  );
};

export default BackgroundClient;
