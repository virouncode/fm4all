import {
  getHygieneConsosTarifs,
  getHygieneDistribQuantite,
  getHygieneDistribTarifs,
  getHygieneInstalDistribTarifs,
} from "@/lib/queries/hygiene/getHygiene";
import {
  getIncendieQuantite,
  getIncendieTarifs,
} from "@/lib/queries/incendie/getIncendie";
import {
  getLegioTarif,
  getMaintenanceQuantites,
  getMaintenanceTarifs,
  getQ18Tarif,
  getQualiteAirTarif,
} from "@/lib/queries/maintenance/getMaintenance";
import {
  getNettoyageQuantites,
  getNettoyageTarifs,
  getRepasseTarifs,
  getVitrerieTarifs,
} from "@/lib/queries/nettoyage/getNettoyage";
import Link from "next/link";
import Hygiene from "./(hygiene)/Hygiene";
import HygieneOptions from "./(hygiene)/HygieneOptions";
import SecuriteIncendie from "./(incendie)/SecuriteIncendie";
import Maintenance from "./(maintenance)/Maintenance";
import Nettoyage from "./(nettoyage)/Nettoyage";
import NettoyageOptions from "./(nettoyage)/NettoyageOptions";

type MesServicesProps = {
  surface: string;
  effectif: string;
};

const MesServices = async ({ surface, effectif }: MesServicesProps) => {
  //Infos filtrées par surface et effectif
  const [
    nettoyageQuantites,
    nettoyageTarifs,
    repasseTarifs,
    vitrerieTarifs,
    hygieneDistribQuantite,
    hygieneDistribTarifs,
    hygieneDistribInstalTarifs,
    hygieneConsosTarifs,
    incendieQuantite,
    incendieTarifs,
    maintenanceQuantites,
    maintenanceTarifs,
    q18Tarif,
    legioTarif,
    qualiteAirTarif,
  ] = await Promise.all([
    getNettoyageQuantites(surface),
    getNettoyageTarifs(surface),
    getRepasseTarifs(surface),
    getVitrerieTarifs(),
    getHygieneDistribQuantite(effectif),
    getHygieneDistribTarifs(),
    getHygieneInstalDistribTarifs(effectif),
    getHygieneConsosTarifs(effectif),
    getIncendieQuantite(surface),
    getIncendieTarifs(surface),
    getMaintenanceQuantites(surface),
    getMaintenanceTarifs(surface),
    getQ18Tarif(surface),
    getLegioTarif(surface),
    getQualiteAirTarif(surface),
  ]);

  if (
    !nettoyageTarifs ||
    nettoyageTarifs.length === 0 ||
    !repasseTarifs ||
    repasseTarifs.length === 0 ||
    !vitrerieTarifs ||
    vitrerieTarifs.length === 0 ||
    !hygieneDistribTarifs ||
    hygieneDistribTarifs.length === 0 ||
    !hygieneDistribInstalTarifs ||
    hygieneDistribInstalTarifs.length === 0 ||
    !hygieneConsosTarifs ||
    hygieneConsosTarifs.length === 0 ||
    !incendieTarifs ||
    incendieTarifs.length === 0 ||
    !maintenanceTarifs ||
    maintenanceTarifs.length === 0 ||
    !incendieTarifs ||
    incendieTarifs.length === 0 ||
    !nettoyageQuantites ||
    nettoyageQuantites.length === 0 ||
    !hygieneDistribQuantite ||
    !maintenanceQuantites ||
    maintenanceQuantites.length === 0 ||
    !incendieQuantite ||
    !q18Tarif ||
    !legioTarif ||
    !qualiteAirTarif
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
      <Nettoyage
        nettoyageQuantites={nettoyageQuantites}
        nettoyageTarifs={nettoyageTarifs}
        repasseTarifs={repasseTarifs}
        vitrerieTarifs={vitrerieTarifs}
        hygieneDistribQuantite={hygieneDistribQuantite}
        hygieneDistribTarifs={hygieneDistribTarifs}
        hygieneDistribInstalTarifs={hygieneDistribInstalTarifs}
        hygieneConsosTarifs={hygieneConsosTarifs}
      />
      <NettoyageOptions
        nettoyageTarifs={nettoyageTarifs}
        repasseTarifs={repasseTarifs}
        vitrerieTarifs={vitrerieTarifs}
      />
      <Hygiene
        hygieneDistribQuantite={hygieneDistribQuantite}
        hygieneDistribTarifs={hygieneDistribTarifs}
        hygieneDistribInstalTarifs={hygieneDistribInstalTarifs}
        hygieneConsosTarifs={hygieneConsosTarifs}
      />
      <HygieneOptions
        hygieneDistribQuantite={hygieneDistribQuantite}
        hygieneDistribTarifs={hygieneDistribTarifs}
        hygieneConsosTarifs={hygieneConsosTarifs}
      />
      <Maintenance
        maintenanceQuantites={maintenanceQuantites}
        maintenanceTarifs={maintenanceTarifs}
        q18Tarif={q18Tarif}
        legioTarif={legioTarif}
        qualiteAirTarif={qualiteAirTarif}
      />
      <SecuriteIncendie
        incendieQuantite={incendieQuantite}
        incendieTarifs={incendieTarifs}
      />
    </section>
  );
};

export default MesServices;
