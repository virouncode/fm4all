import { getFournisseur } from "@/lib/queries/fournisseurs/getFournisseurs";
import FournisseurAccountForm from "./FournisseurAccountForm";
import FournisseurEmailForm from "./FournisseurEmailForm";
import FournisseurPasswordForm from "./FournisseurPasswordForm";
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
        <h1 className="mb-14 text-4xl">Mon compte</h1>
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
