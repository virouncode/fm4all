import DevisButton from "@/components/devis-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getScopedI18n } from "@/locales/server";
import Image from "next/image";

const Hero = async () => {
  const t = await getScopedI18n("hero");

  return (
    <section
      className="flex items-center justify-center min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-4rem)] bg-hero-img
      bg-cover bg-center bg-no-repeat p-6"
      id="hero"
    >
      <div className="flex w-11/12 sm:w-3/4 md:max-w-5xl rounded-xl overflow-hidden">
        <Card className="flex-1 rounded-none py-4">
          <CardHeader>
            <CardTitle>
              <h1 className="text-3xl md:text-4xl text-center text-fm4allsecondary text-pretty font-bold">
                {t("title")}
              </h1>
            </CardTitle>
            <CardDescription>
              <h2 className="text-lg md:text-xl text-center mt-6 font-bold">
                {t("subtitle")}
              </h2>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 text-base md:text-lg">
            <p className="text-center">
              <strong>{t("descriptionStrong")}</strong> {t("description")}
            </p>
            <div className="flex justify-center">
              <ul className="ml-10 mb-4">
                <li className="list-check">
                  <strong>{t("compare")}</strong> {t("byRange")}{" "}
                  <span className="text-fm4allessential font-bold">
                    {t("essential")}
                  </span>
                  ,{" "}
                  <span className="text-fm4allcomfort font-bold">
                    {t("comfort")}
                  </span>
                  ,{" "}
                  <span className="text-fm4allexcellence font-bold">
                    {t("excellence")}
                  </span>
                </li>
                <li className="list-check">
                  <strong>{t("simplify")}</strong> {t("simplifyServices")}
                </li>
                <li className="list-check">
                  <strong>{t("delegate")}</strong> {t("delegateManagement")}
                </li>
              </ul>
            </div>
            <div className="hidden w-full md:flex justify-center">
              <DevisButton
                title={t("online_quote")}
                text={t("online_quote")}
                size="lg"
              />
            </div>
            <div className="flex w-full md:hidden justify-center">
              <DevisButton
                title={t("mobile_quote")}
                text={t("mobile_quote")}
                size="lg"
              />
            </div>
          </CardContent>
        </Card>
        <div className="w-[365px] h-[500px] relative overflow-hidden hidden lg:block">
          <Image
            src={"/img/two_collaborators.webp"}
            alt="deux-collaborateurs-se-serrent-la-main"
            className="object-cover object-center"
            fill={true}
            priority
            fetchPriority="high"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
