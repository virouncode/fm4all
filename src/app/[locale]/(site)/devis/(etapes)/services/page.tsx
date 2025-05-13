import { Link } from "@/i18n/navigation";
import { generateAlternates } from "@/lib/metadata/metadata-helpers";
import { getLocale, getTranslations } from "next-intl/server";
import { Metadata } from "next/types";
import { Suspense } from "react";
import ServicesLoader from "../locaux/ServicesLoader";
import MesServices from "./MesServices";

export const generateMetadata = async (): Promise<Metadata> => {
  const locale = await getLocale();
  return generateAlternates(
    "servicesDevis",
    locale,
    locale === "fr" ? "Mes services" : "My services",
    locale === "fr"
      ? "Etape 2 du devis : choisissez vos services"
      : "Quote Step 2: Choose your services"
  );
};

const page = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const t = await getTranslations("DevisPage");
  const tServices = await getTranslations("DevisPage.services");
  const { surface, effectif } = await searchParams;
  if (!surface || !effectif) {
    return (
      <section className="flex h-dvh items-center justify-center text-lg">
        <p>
          {t("vous-devez-d-abord-remplir-les-informations-sur-vos")}{" "}
          <Link href="/devis/locaux" className="underline">
            {t("vos-locaux")}
          </Link>
          .
        </p>
      </section>
    );
  }
  if (
    isNaN(parseInt(surface as string)) ||
    isNaN(parseInt(effectif as string))
  ) {
    return (
      <section className="flex h-dvh items-center justify-center text-lg">
        <p>
          {t(
            "les-valeurs-de-surface-et-effectif-renseignees-ne-sont-pas-valides"
          )}{" "}
          <Link href="/devis/locaux" className="underline">
            {t("veuillez-reessayer")}
          </Link>
          .
        </p>
      </section>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl md:text-4xl">{tServices("2-mes-services")}</h1>
      </div>
      <Suspense fallback={<ServicesLoader />}>
        <MesServices surface={surface} effectif={effectif} />
      </Suspense>
    </>
  );
};

export default page;
