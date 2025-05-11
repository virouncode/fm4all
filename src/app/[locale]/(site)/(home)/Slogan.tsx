import { getTranslations } from "next-intl/server";
import Image from "next/image";

const Slogan = async () => {
  const t = await getTranslations("Global");
  return (
    <section className="flex flex-col lg:flex-row justify-center lg:gap-10 gap-6 items-center max-w-7xl w-full mx-auto p-12 relative">
      <div className="h-[50px] w-[200px] relative rounded-xl overflow-hidden ">
        <Image
          src={"/img/logo_full.webp"}
          alt={"logo-fm4all"}
          fill={true}
          sizes="300px"
          className="object-contain object-center"
          loading="lazy"
        />
      </div>
      <h2 className="text-5xl text-center text-destructive font-bold">
        {t("le-facility-management-pour-tous")}
      </h2>
    </section>
  );
};

export default Slogan;
