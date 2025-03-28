import { Link } from "@/i18n/navigation";
import { Metadata } from "next";
import { Suspense } from "react";
import ServicesLoader from "../(etapes)/mes-locaux/ServicesLoader";
import SauvegarderProgression from "./SauvegarderProgression";

export const metadata: Metadata = {
  title: "Sauvegarder",
  description: "Etape 5 du devis: sauvegarder votre progression",
};

const page = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const { surface, effectif, typeBatiment, typeOccupation } =
    await searchParams;

  if (!surface || !effectif || !typeBatiment || !typeOccupation) {
    return (
      <section className="flex h-dvh items-center justify-center text-lg">
        <p>
          Vous devez d&apos;abord remplir les informations sur vos{" "}
          <Link href="/mon-devis/mes-locaux" className="underline">
            locaux
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
          Les informations sur votre type de bâtiment ou d&apos;occupation ne
          sont pas valides.{" "}
          <Link href="/mon-devis/mes-locaux" className="underline">
            Veuillez réessayez
          </Link>
          .
        </p>
      </section>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl md:text-4xl">5. Sauvegarder ma progression</h1>
      </div>
      <Suspense fallback={<ServicesLoader />}>
        <SauvegarderProgression />
      </Suspense>
    </>
  );
};

export default page;
