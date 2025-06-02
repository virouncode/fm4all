import { getFournisseur } from "@/lib/queries/fournisseurs/getFournisseurs";
import FournisseurAccountForm from "./FournisseurAccountForm";
import FournisseurEmailForm from "./FournisseurEmailForm";
import FournisseurPasswordForm from "./FournisseurPasswordForm";

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
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-6 hyphens-auto flex-1">
      <section className="mt-2">
        <h1 className="text-4xl mb-14">Mon compte</h1>
        <div className="flex flex-col gap-14">
          <FournisseurAccountForm initialFournisseur={fournisseur} />
          <FournisseurEmailForm initialFournisseur={fournisseur} />
          <FournisseurPasswordForm />
        </div>
      </section>
    </main>
  );
};

export default page;
