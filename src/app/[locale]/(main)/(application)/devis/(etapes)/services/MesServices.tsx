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
  getNettoyageProduits,
  getNettoyageQuantites,
} from "@/lib/queries/nettoyage/getNettoyage";
import { getPanier } from "@/lib/queries/panier/getPanier";
import { SprayCan, Toilet } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Nettoyage from "./(nettoyage)/Nettoyage";
import NettoyageOptions from "./(nettoyage)/NettoyageOptions";
import ServiceWrapper from "./(nettoyage)/ServiceWrapper";
import MesServicesPresentation from "./(presentation)/MesServicesPresentation";

type MesServicesProps = {
  surface: string;
  effectif: string;
};

const MesServices = async ({ surface, effectif }: MesServicesProps) => {
  const t = await getTranslations("DevisPage");
  const tNettoyage = await getTranslations("DevisPage.services.nettoyage");
  const tHygiene = await getTranslations("DevisPage.services.hygiene");
  const tMaintenance = await getTranslations("DevisPage.services.maintenance");
  const tIncendie = await getTranslations("DevisPage.services.incendie");
  //Infos filtrées par surface et effectif
  const [
    nettoyageQuantites,
    nettoyageProduits,
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
    getNettoyageProduits(surface),
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
    !nettoyageProduits ||
    nettoyageProduits.length === 0 ||
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

  const panier = await getPanier();
  const nettoyageOffreId = Object.keys(panier ?? {})
    .find((k) => k.startsWith("Nettoyage:"))
    ?.split(":")[1];
  const nettoyageProduit = nettoyageProduits.find((p) =>
    nettoyageOffreId ? p.id === parseInt(nettoyageOffreId) : false,
  );

  const gammeNettoyage = nettoyageProduit?.gamme ?? null;

  const services: {
    id: number;
    title: string;
    icon: React.ReactNode;
    description: string;
  }[] = [
    {
      id: 1,
      title: tNettoyage("nettoyage-et-proprete"),
      icon: <SprayCan />,
      description: tNettoyage(
        "dun-nettoyage-essentiel-a-une-experience-5-etoiles-choisissez-la-prestation-proprete-qui-vous-ressemble-la-gamme-determine-la-frequence-de-passage-et-la-cadence-de-nettoyage",
      ),
    },
    {
      id: 2,
      title: tNettoyage("nettoyage-et-proprete-options"),
      icon: <SprayCan />,
      description: gammeNettoyage
        ? tNettoyage(
            "choisissez-vos-options-en-gamme-capitalize-nettoyage-infos-gammeselected-chez-nettoyage-infos-nomfournisseur",
            { gamme: gammeNettoyage, nomFournisseur: "FM4ALL" },
          )
        : "",
    },
    {
      id: 3,
      title: "Hygiène sanitaire",
      icon: <Toilet />,
      description: tHygiene(
        "un-tarif-forfaitaire-tout-compris-pour-vos-sanitaires-avec-distributeurs-et-consommables-mis-en-place-essuie-main-papier-savon-and-papier-hygienique-la-gamme-determine-la-finition-des-distributeurs",
      ),
    },
    {
      id: 4,
      title: "Maintenance",
      icon: <SprayCan />,
      description: tMaintenance(
        "Obligations légales & veille réglementaire, bien-être, petits travaux, lien avec le gestionnaire de l’immeuble... déléguez la maintenance et le suivi de vos contrôles.",
      ),
    },
    {
      id: 5,
      title: "Sécurité Incendie",
      icon: <SprayCan />,
      description: tIncendie(
        "Extincteurs, blocs autonomes d'éclairage de sécurité (BAES), télécommande BAES, laissez nos experts vérifier vos installations.",
      ),
    },
  ];

  return (
    <section className="flex-1 lg:overflow-hidden">
      <MesServicesPresentation />
      <ServiceWrapper service={services[0]}>
        <Nettoyage
          nettoyageQuantites={nettoyageQuantites}
          nettoyageProduits={nettoyageProduits}
        />
      </ServiceWrapper>
      <ServiceWrapper service={services[1]}>
        <NettoyageOptions nettoyageQuantites={nettoyageQuantites} />
      </ServiceWrapper>

      {/* <NettoyageOptions
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
      <NextEtapeFoodButton /> */}
    </section>
  );
};

export default MesServices;
