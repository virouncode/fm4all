import { getFournisseur } from "@/lib/queries/fournisseurs/getFournisseurs";
import FournisseurUpdateForm from "./FournisseurUpdateForm";

const page = async ({
  params,
}: {
  params: Promise<{ fournisseurId: string | null }>;
}) => {
  const { fournisseurId } = await params;
  if (!fournisseurId) {
    return <div>Fournisseur non trouvé</div>;
  }
  const fournisseur = await getFournisseur(parseInt(fournisseurId));
  if (!fournisseur) {
    return <div>Fournisseur non trouvé</div>;
  }

  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20 hyphens-auto">
      <section className="mt-6">
        <h1 className="text-4xl mb-6">Mon profil</h1>
        {/* <div className="flex gap-2 items-center mb-6">
          <Lightbulb size={20} />
          <p className="text-base italic ">
            Comment vous apparaissez dans le funnel
          </p>
        </div> */}
        <FournisseurUpdateForm initialFournisseur={fournisseur} />
      </section>
    </main>
  );
};

export default page;
