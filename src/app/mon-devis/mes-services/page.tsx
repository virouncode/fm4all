import { gammes, GammeType } from "@/zod-schemas/gamme";
import Link from "next/link";
import { Suspense } from "react";
import ServicesLoader from "../mes-locaux/ServicesLoader";
import MesServices from "./MesServices";

const page = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const { surface, effectif, fournisseurId, nettoyageGamme } =
    await searchParams;
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
  if (fournisseurId && isNaN(parseInt(fournisseurId as string))) {
    return (
      <section className="flex h-dvh items-center justify-center text-lg">
        <p>
          L&apos;identifiant du fournisseur n&apos;est pas valide.{" "}
          <Link href="/mon-devis/mes-locaux" className="underline">
            Veuillez réessayer
          </Link>
          .
        </p>
      </section>
    );
  }
  const isGammeType = (value: string): value is GammeType => {
    return gammes.includes(value as GammeType);
  };
  if (nettoyageGamme && !isGammeType(nettoyageGamme)) {
    return (
      <section className="flex h-dvh items-center justify-center text-lg">
        <p>
          La gamme de nettoyage n&apos;est pas valide.
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
        <h1 className="text-3xl md:text-4xl">Mes services</h1>
      </div>
      <Suspense fallback={<ServicesLoader />}>
        <MesServices
          surface={surface}
          effectif={effectif}
          fournisseurId={fournisseurId}
          nettoyageGamme={nettoyageGamme as GammeType}
        />
      </Suspense>
    </>
  );
};

export default page;
