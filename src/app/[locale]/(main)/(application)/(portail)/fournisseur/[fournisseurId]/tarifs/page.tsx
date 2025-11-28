import ServicePresentationCard from "@/components/cards/ServicePresentationCard";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getServicesForFournisseur } from "@/lib/queries/services/getServices";

const page = async ({
  params,
}: {
  params: Promise<{ fournisseurId: string }>;
}) => {
  const { fournisseurId } = await params;
  const services = await getServicesForFournisseur(parseInt(fournisseurId));
  return (
    <main className="mx-auto mb-24 max-w-7xl flex-1 px-6 py-4 hyphens-auto md:px-6">
      <section className="mt-2">
        <h1 className="mb-10 text-4xl">Mes tarifs</h1>
        <div className="flex flex-col gap-14">
          <div className="flex flex-col gap-2 px-10">
            <div className="mb-10 flex items-center justify-between">
              <h2 className="text-2xl">Mes services</h2>
              <Link
                href={{
                  pathname: "/fournisseur/[fournisseurId]/tarifs/ajouter",
                  params: { fournisseurId },
                }}
              >
                <Button size="lg" title="Ajouter un service">
                  Ajouter un service
                </Button>
              </Link>
            </div>
            {services && services.length > 0 && (
              <>
                <p className="mb-6 text-center">Accédez à vos DPGF : </p>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] items-center justify-center gap-6">
                  {services.map((service) => (
                    <ServicePresentationCard
                      key={service.id}
                      href={{
                        pathname:
                          "/fournisseur/[fournisseurId]/tarifs/[service]",
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
            )}
          </div>
          <div className="flex flex-col gap-2 px-10">
            <h2 className="text-2xl">Mon historique</h2>
          </div>
        </div>
      </section>
    </main>
  );
};

export default page;
