import { Link } from "@/i18n/navigation";
import { Metadata } from "next";
import { Suspense } from "react";
import ServicesLoader from "../mes-locaux/ServicesLoader";
import PilotagePrestations from "./PilotagePrestations";

export const metadata: Metadata = {
  title: "Pilotage Prestations",
  description:
    "Etape 4 du devis: pourquoi pas un office manager dans vos locaux ?",
};

const page = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const { surface, effectif } = await searchParams;
  if (!surface || !effectif) {
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
    isNaN(parseInt(surface as string)) ||
    isNaN(parseInt(effectif as string))
  ) {
    return (
      <section className="flex h-dvh items-center justify-center text-lg">
        <p>
          Les valeurs de surface et effectif renseignées ne sont pas valides.{" "}
          <Link href="/mon-devis/mes-locaux" className="underline">
            Veuillez réessayer
          </Link>
          .
        </p>
      </section>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl md:text-4xl">4. Pilotage Prestations</h1>
      </div>
      <Suspense fallback={<ServicesLoader />}>
        <PilotagePrestations surface={surface} effectif={effectif} />
      </Suspense>
    </>
  );
};

export default page;
