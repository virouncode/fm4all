import { useTranslations } from "next-intl";
import Image from "next/image";

const Slogan = () => {
  const t = useTranslations("Global");
  return (
    <section className="relative mx-auto flex w-full max-w-7xl flex-col items-center justify-center gap-6 p-12 lg:flex-row lg:gap-10">
      <div className="relative h-[50px] w-[200px] overflow-hidden rounded-xl">
        <Image
          src={"/img/logo_full.webp"}
          alt={"logo-fm4all"}
          fill
          sizes="200px"
          className="object-contain object-center"
        />
      </div>
      <h2 className="text-destructive text-center text-5xl font-bold tracking-tighter">
        {t("le-facility-management-pour-tous")}
      </h2>
    </section>
  );
};

export default Slogan;
