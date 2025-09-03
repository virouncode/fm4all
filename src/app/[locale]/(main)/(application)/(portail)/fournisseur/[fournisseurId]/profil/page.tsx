import { getFournisseur } from "@/lib/queries/fournisseurs/getFournisseurs";
import FournisseurUpdateForm from "./FournisseurUpdateForm";
import { notFound } from "next/navigation";

const page = async ({
  params,
}: {
  params: Promise<{ fournisseurId: string }>;
}) => {
  const { fournisseurId } = await params;
  const fournisseur = await getFournisseur(parseInt(fournisseurId));
  if (!fournisseur) {
    notFound();
  }

  return (
    <main className="mx-auto mb-24 max-w-7xl flex-1 hyphens-auto px-6 py-4 md:px-6">
      <section className="mt-2">
        <h1 className="mb-14 text-4xl">Mon profil</h1>
        <FournisseurUpdateForm initialFournisseur={fournisseur} />
      </section>
    </main>
  );
};

export default page;
