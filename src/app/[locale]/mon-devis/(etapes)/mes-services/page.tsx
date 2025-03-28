import { Link } from "@/i18n/navigation";
import { Metadata } from "next";
import { Suspense } from "react";
import ServicesLoader from "../mes-locaux/ServicesLoader";
import MesServices from "./MesServices";

export const metadata: Metadata = {
  title: "Mes Services",
  description: "Etape 2 du devis: choisissez vos services",
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
        <h1 className="text-3xl md:text-4xl">2. Mes services</h1>
      </div>
      <Suspense fallback={<ServicesLoader />}>
        <MesServices surface={surface} effectif={effectif} />
      </Suspense>
    </>
  );
};

export default page;
