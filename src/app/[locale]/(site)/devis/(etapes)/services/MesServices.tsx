import { Link } from "@/i18n/navigation";
import {
  getHygieneConsosTarifs,
  getHygieneDistribQuantite,
  getHygieneDistribTarifs,
  getHygieneInstalDistribTarifs,
  getHygieneMinFacturation,
} from "@/lib/queries/hygiene/getHygiene";
import {
  getIncendieQuantite,
  getIncendieTarifs,
} from "@/lib/queries/incendie/getIncendie";
import {
  getLegioTarifs,
  getMaintenanceQuantites,
  getMaintenanceTarifs,
  getQ18Tarifs,
  getQualiteAirTarifs,
} from "@/lib/queries/maintenance/getMaintenance";
import {
  getNettoyageQuantites,
  getNettoyageTarifs,
  getRepasseTarifs,
  getVitrerieTarifs,
} from "@/lib/queries/nettoyage/getNettoyage";
import { getTranslations } from "next-intl/server";
import NextEtapeFoodButton from "../../NextEtapeFoodButton";
import Hygiene from "./(hygiene)/Hygiene";
import HygieneOptions from "./(hygiene)/HygieneOptions";
import SecuriteIncendie from "./(incendie)/SecuriteIncendie";
import Maintenance from "./(maintenance)/Maintenance";
import Nettoyage from "./(nettoyage)/Nettoyage";
import NettoyageOptions from "./(nettoyage)/NettoyageOptions";
import MesServicesPresentation from "./(presentation)/MesServicesPresentation";

type MesServicesProps = {
  surface: string;
  effectif: string;
};

const MesServices = async ({ surface, effectif }: MesServicesProps) => {
  const t = await getTranslations("DevisPage");
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
    hygieneMinFacturation,
    incendieQuantite,
    incendieTarifs,
    maintenanceQuantites,
    maintenanceTarifs,
    q18Tarifs,
    legioTarifs,
    qualiteAirTarifs,
  ] = await Promise.all([
    getNettoyageQuantites(surface),
    getNettoyageTarifs(surface),
    getRepasseTarifs(surface),
    getVitrerieTarifs(),
    getHygieneDistribQuantite(effectif),
    getHygieneDistribTarifs(),
    getHygieneInstalDistribTarifs(effectif),
    getHygieneConsosTarifs(effectif),
    getHygieneMinFacturation(),
    getIncendieQuantite(surface),
    getIncendieTarifs(surface),
    getMaintenanceQuantites(surface),
    getMaintenanceTarifs(surface),
    getQ18Tarifs(surface),
    getLegioTarifs(surface),
    getQualiteAirTarifs(surface),
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
    !hygieneMinFacturation ||
    hygieneMinFacturation.length === 0 ||
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
    !q18Tarifs ||
    q18Tarifs.length === 0 ||
    !legioTarifs ||
    legioTarifs.length === 0 ||
    !qualiteAirTarifs ||
    qualiteAirTarifs.length === 0
  ) {
    return (
      <section className="flex h-dvh items-center justify-center text-lg">
        <p>
          {t("nous-n-avons-pas-trouve-de-tarifs-pour-ces-informations")}{" "}
          <Link href="/devis/locaux" className="underline">
            {t("veuillez-reessayer")}
          </Link>
          .
        </p>
      </section>
    );
  }

  return (
    <section className="flex-1 lg:overflow-hidden">
      <MesServicesPresentation />
      <Nettoyage
        nettoyageQuantites={nettoyageQuantites}
        nettoyageTarifs={nettoyageTarifs}
        repasseTarifs={repasseTarifs}
        vitrerieTarifs={vitrerieTarifs}
        hygieneDistribQuantite={hygieneDistribQuantite}
        hygieneDistribTarifs={hygieneDistribTarifs}
        hygieneDistribInstalTarifs={hygieneDistribInstalTarifs}
        hygieneConsosTarifs={hygieneConsosTarifs}
        hygieneMinFacturation={hygieneMinFacturation}
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
        hygieneMinFacturation={hygieneMinFacturation}
      />
      <HygieneOptions
        hygieneDistribQuantite={hygieneDistribQuantite}
        hygieneDistribTarifs={hygieneDistribTarifs}
        hygieneConsosTarifs={hygieneConsosTarifs}
      />
      <Maintenance
        maintenanceQuantites={maintenanceQuantites}
        maintenanceTarifs={maintenanceTarifs}
        q18Tarifs={q18Tarifs}
        legioTarifs={legioTarifs}
        qualiteAirTarifs={qualiteAirTarifs}
      />
      <SecuriteIncendie
        incendieQuantite={incendieQuantite}
        incendieTarifs={incendieTarifs}
      />
      <NextEtapeFoodButton />
    </section>
  );
};

export default MesServices;
