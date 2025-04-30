import ServicePresentationCard from "@/components/cards/ServicePresentationCard";
import { Button } from "@/components/ui/button";
import { getServicesForFournisseur } from "@/lib/queries/services/getServices";
import { capitalize } from "@/lib/utils/capitalize";
import { SprayCan, Toilet } from "lucide-react";

const servicesIcons = {
  nettoyage: <SprayCan />,
  hygiene: <Toilet />,
};

const page = async ({
  params,
}: {
  params: Promise<{ fournisseurId: number }>;
}) => {
  const { fournisseurId } = await params;
  const services = await getServicesForFournisseur(fournisseurId);
  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20 hyphens-auto">
      <section className="mt-6">
        <h1 className="text-4xl mb-10">Mes tarifs</h1>

        <div className="flex flex-col gap-2 px-10">
          <div className="flex justify-between items-center  mb-10">
            <h2 className="text-2xl">Mes services</h2>
            <Button variant="destructive" size="lg" title="Ajouter un service">
              Ajouter un service
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
                  icon={
                    servicesIcons[service.nom as keyof typeof servicesIcons]
                  }
                  title={capitalize(service.nom)}
                />
              ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default page;
