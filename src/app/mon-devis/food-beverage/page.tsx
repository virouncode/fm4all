import Link from "next/link";
import { Suspense } from "react";
import ServicesLoader from "../mes-locaux/ServicesLoader";
import FoodBeverage from "./FoodBeverage";

const page = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const { cafeFournisseurId, effectif } = await searchParams;

  if (!effectif) {
    return (
      <section className="flex flex-col gap-6">
        Veuillez d&apos;abord remplir les informations sur vos
        <Link href="/mon-devis/mes-locaux" className="underline">
          locaux
        </Link>
        .
      </section>
    );
  }
  if (effectif && isNaN(parseInt(effectif))) {
    return (
      <section className="flex flex-col gap-6">
        L&apos;effectif renseigné n$apos;est pas un nombre valide.
        <Link href="/mon-devis/mes-locaux" className="underline">
          Veuillez réessayer
        </Link>
        .
      </section>
    );
  }
  if (cafeFournisseurId && isNaN(parseInt(cafeFournisseurId))) {
    return (
      <section className="flex flex-col gap-6">
        L&apos;identifiant du fournisseur de café n&apos;est pas valide.
        <Link href="/mon-devis/mes-locaux" className="underline">
          Veuillez réessayer
        </Link>
        .
      </section>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl md:text-4xl">Food & Beverage</h1>
      </div>
      <Suspense fallback={<ServicesLoader />}>
        <FoodBeverage
          cafeFournisseurId={cafeFournisseurId}
          effectif={effectif as string}
        />
      </Suspense>
    </>
  );
};

export default page;
