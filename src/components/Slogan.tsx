import { getTranslations } from "next-intl/server";
import Image from "next/image";

const Slogan = async () => {
  const t = await getTranslations("Global");
  return (
    <section className="flex flex-col lg:flex-row justify-center lg:gap-10 gap-6 items-center max-w-7xl w-full mx-auto p-12 relative">
      {/* <div className="absolute -top-32 -right-72 w-[1000px] h-[1000px] bg-yellow-100 rounded-full opacity-50 -z-10"></div> */}
      <div className="h-[50px] w-[200px] relative rounded-xl overflow-hidden">
        <Image
          src={"/img/logo_full.webp"}
          alt={"logo-fm4all"}
          fill={true}
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
