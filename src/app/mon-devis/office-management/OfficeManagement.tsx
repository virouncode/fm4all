import {
  getOfficeManagerQuantites,
  getOfficeManagerTarifs,
} from "@/lib/queries/officeManager/getOfficeManager";
import Link from "next/link";
import OfficeManager from "./(office-management)/OfficeManager";
import ServicesFm4All from "./(services-fm4all)/ServicesFm4All";

type OfficeManagementProps = {
  surface: string;
  effectif: string;
};

const OfficeManagement = async ({
  surface,
  effectif,
}: OfficeManagementProps) => {
  const [officeManagerQuantites, officeManagerTarifs] = await Promise.all([
    getOfficeManagerQuantites(surface, effectif),
    getOfficeManagerTarifs(),
  ]);

  if (
    !officeManagerQuantites ||
    !officeManagerTarifs ||
    !officeManagerTarifs.length ||
    !officeManagerQuantites.length
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
    <section className="flex-1 overflow-hidden">
      <OfficeManager
        officeManagerQuantites={officeManagerQuantites}
        officeManagerTarifs={officeManagerTarifs}
      />
      <ServicesFm4All />
    </section>
  );
};

export default OfficeManagement;
