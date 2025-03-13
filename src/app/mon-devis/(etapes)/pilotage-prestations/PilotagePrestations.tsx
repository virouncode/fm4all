import {
  getOfficeManagerQuantites,
  getOfficeManagerTarifs,
} from "@/lib/queries/officeManager/getOfficeManager";
import {
  getServicesFm4AllOffres,
  getServicesFm4AllTaux,
} from "@/lib/queries/services-fm4all/getServicesFm4All";
import Link from "next/link";
import OfficeManager from "./(office-manager)/OfficeManager";
import ServicesFm4All from "./(services-fm4all)/ServicesFm4All";

type PilotagePrestationsProps = {
  surface: string;
  effectif: string;
};

const PilotagePrestations = async ({
  surface,
  effectif,
}: PilotagePrestationsProps) => {
  const [
    officeManagerQuantites,
    officeManagerTarifs,
    servicesFm4AllTaux,
    servicesFm4AllOffres,
  ] = await Promise.all([
    getOfficeManagerQuantites(surface, effectif),
    getOfficeManagerTarifs(),
    getServicesFm4AllTaux(),
    getServicesFm4AllOffres(),
  ]);

  if (
    !officeManagerQuantites ||
    !officeManagerTarifs ||
    !officeManagerTarifs.length ||
    !officeManagerQuantites.length ||
    !servicesFm4AllTaux ||
    !servicesFm4AllTaux.length ||
    !servicesFm4AllOffres ||
    !servicesFm4AllOffres.length
  ) {
    return (
      <section className="flex h-dvh items-center justify-center text-lg">
        <p>
          Nous n&apos;avons pas trouvé de tarifs pour ces informations.{" "}
          <Link href="/mon-devis/mes-locaux" className="underline">
            Veuillez réessayer
          </Link>
          .
        </p>
      </section>
    );
  }
  return (
    <section className="flex-1 lg:overflow-hidden">
      <OfficeManager
        officeManagerQuantites={officeManagerQuantites}
        officeManagerTarifs={officeManagerTarifs}
      />
      <ServicesFm4All
        servicesFm4AllTaux={servicesFm4AllTaux}
        servicesFm4AllOffres={servicesFm4AllOffres}
      />
    </section>
  );
};

export default PilotagePrestations;
