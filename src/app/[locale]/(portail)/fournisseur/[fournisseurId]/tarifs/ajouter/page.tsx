import { getServicesForFournisseur } from "@/lib/queries/services/getServices";
import AddServicesTarifForm from "./AddServicesTarifForm";

const page = async ({
  params,
}: {
  params: Promise<{ fournisseurId: string }>;
}) => {
  const { fournisseurId } = await params;
  const services = await getServicesForFournisseur(parseInt(fournisseurId));

  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-6 hyphens-auto flex-1">
      <section className="mt-2">
        <h1 className="text-4xl mb-10">Mes tarifs</h1>
        <h2 className="text-xl mb-10">Ajouter un/des service(s)</h2>
        <AddServicesTarifForm
          fournisseurServices={services?.map((service) => service.nom)}
          fournisseurId={parseInt(fournisseurId)}
        />
      </section>
    </main>
  );
};

export default page;
