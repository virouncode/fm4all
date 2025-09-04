import { getTranslations } from "next-intl/server";
import Image from "next/image";

const BackgroundServer = async () => {
  const tGlobal = await getTranslations("Global");
  return (
    <div className="absolute inset-0 -z-10">
      <Image
        src={"/img/hero_background.webp"}
        alt={tGlobal(
          "une-image-de-bureaux-modernes-et-lumineux-avec-des-plantes-vertes",
        )}
        className="object-fit object-center"
        quality={75}
        fill
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/90"></div>
    </div>
  );
};

export default BackgroundServer;
