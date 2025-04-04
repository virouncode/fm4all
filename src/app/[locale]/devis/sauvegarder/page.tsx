import { Link } from "@/i18n/navigation";
import { generateAlternates } from "@/lib/metadata-helpers";
import { getLocale, getTranslations } from "next-intl/server";
import { Suspense } from "react";
import ServicesLoader from "../(etapes)/locaux/ServicesLoader";
import SauvegarderProgression from "./SauvegarderProgression";
import { Metadata } from "next";

export const generateMetadata = async (): Promise<Metadata> => {
  const locale = await getLocale();
  return generateAlternates(
    "sauverDevis",
    locale,
    locale === "fr" ? "Sauvegarder ma progression" : "Save my progress",
    locale === "fr"
      ? "Etape 5 du devis: sauvegarder votre progression"
      : "Quote Step 5: save your progress"
  );
};

const page = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const t = await getTranslations("DevisPage");
  const tSauver = await getTranslations("DevisPage.sauver");
  const { surface, effectif, typeBatiment, typeOccupation } =
    await searchParams;

  if (!surface || !effectif || !typeBatiment || !typeOccupation) {
    return (
      <section className="flex h-dvh items-center justify-center text-lg">
        <p>
          {tSauver("vous-devez-d-abord-remplir-les-informations-sur-vos")}{" "}
          <Link href="/devis/locaux" className="underline">
            {t("vos-locaux")}
          </Link>
          .
        </p>
      </section>
    );
  }
  if (
    !["bureaux", "localCommercial", "entrepot", "cabinetMedical"].includes(
      typeBatiment
    ) ||
    !["partieEtage", "plateauComplet", "batimentEntier"].includes(
      typeOccupation
    )
  ) {
    return (
      <section className="flex h-dvh items-center justify-center text-lg">
        <p>
          {tSauver(
            "les-informations-sur-votre-type-de-batiment-ou-doccupation-ne-sont-pas-valides"
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
        <h1 className="text-3xl md:text-4xl">
          {tSauver("5-sauvegarder-ma-progression")}
        </h1>
      </div>
      <Suspense fallback={<ServicesLoader />}>
        <SauvegarderProgression />
      </Suspense>
    </>
  );
};

export default page;
