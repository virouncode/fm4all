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
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-6 hyphens-auto flex-1">
      <section className="mt-2">
        <h1 className="text-4xl mb-10">Mes tarifs</h1>
        <div className="flex flex-col gap-14">
          <div className="flex flex-col gap-2 px-10">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl">Mes services</h2>
              <Button
                variant="destructive"
                size="lg"
                title="Ajouter un service"
              >
                <Link
                  href={{
                    pathname: "/fournisseur/[fournisseurId]/tarifs/ajouter",
                    params: { fournisseurId },
                  }}
                  className="w-full"
                >
                  Ajouter un service
                </Link>
              </Button>
            </div>
            <p className="mb-6 text-center">Accédez à vos DPGF : </p>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6 items-center justify-center">
              {services &&
                services.map((service) => (
                  <ServicePresentationCard
                    key={service.id}
                    href={{
                      pathname: "/fournisseur/[fournisseurId]/tarifs/[service]",
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
