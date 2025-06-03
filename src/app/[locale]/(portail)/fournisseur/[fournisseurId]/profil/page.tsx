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
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-6 hyphens-auto flex-1">
      <section className="mt-2">
        <h1 className="text-4xl mb-14">Mon profil</h1>
        <FournisseurUpdateForm initialFournisseur={fournisseur} />
      </section>
    </main>
  );
};

export default page;
