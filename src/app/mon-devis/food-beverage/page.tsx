import Link from "next/link";
import { Suspense } from "react";
import ServicesLoader from "../mes-locaux/ServicesLoader";
import FoodBeverage from "./FoodBeverage";

const page = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const { cafeFournisseurId } = await searchParams;

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
        <FoodBeverage cafeFournisseurId={cafeFournisseurId} />
      </Suspense>
    </>
  );
};

export default page;
