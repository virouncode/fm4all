import ServicePresentationCard from "@/components/cards/ServicePresentationCard";
import { getServicesForFournisseur } from "@/lib/queries/services/getServices";

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
        <h1 className="text-4xl mb-14">Mes produits</h1>
        <div className="flex flex-col gap-14">
          <div className="flex flex-col gap-2 px-10">
            <div className="mb-10">
              <h2 className="text-2xl">Mes services</h2>
            </div>
            {services && services.length > 0 ? (
              <>
                <p className="mb-6 text-center">Accédez à vos produits : </p>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6 items-center justify-center">
                  {services.map((service) => (
                    <ServicePresentationCard
                      key={service.id}
                      href={{
                        pathname:
                          "/fournisseur/[fournisseurId]/produits/[service]",
                        params: {
                          fournisseurId: fournisseurId,
                          service: service.nom,
                        },
                      }}
                      icons={service.icons}
                      title={service.titre}
                    />
                  ))}
                </div>
              </>
            ) : (
              <p className="text-center hyphens-auto">
                Veuillez ajouter un service dans &quot;Mes tarifs&quot;
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default page;
