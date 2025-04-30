import WhyCard from "@/components/cards/WhyCard";
import LoaderFm4all from "@/components/loaders/LoaderFm4all";
import { Euro, Feather, Handshake, Rabbit, Waves } from "lucide-react";
import { useTranslations } from "next-intl";

const ServicesLoader = () => {
  const t = useTranslations("HomePage.pourquoi");
  const tLoader = useTranslations("DevisPage.loader");
  return (
    <section className="flex-1 overflow-hidden">
      <div className="flex flex-col gap-10">
        <LoaderFm4all src="/img/logo_simple.webp" alt="logo-fm4all-simple" />
        <div className="text-lg mx-auto max-w-prose mt-10 animate-pulse text-center">
          {tLoader(
            "vous-allez-obtenir-des-devis-qui-beneficient-du-service-de-gestion-centralise-fm4all"
          )}{" "}
          <br />
          {tLoader("un-seul-interlocuteur-un-seul-contrat-une-seule-facture")}
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2 animate-pulse">
          <WhyCard
            title={t("simplicite")}
            content={t(
              "3-gammes-de-services-standardisees-pour-une-comparaison-et-un-choix-faciles"
            )}
            icon={Feather}
          />
          <WhyCard
            title={t("rapidite")}
            content={t(
              "devis-personnalises-en-ligne-en-quelques-minutes-pret-a-demarrer"
            )}
            icon={Rabbit}
          />
          <WhyCard
            title={t("fiabilite")}
            content={t(
              "contrats-clairs-et-partenaires-de-confiance-rigoureusement-selectionnes"
            )}
            icon={Handshake}
          />
          <WhyCard
            title={t("serenite")}
            content={t(
              "centralisation-des-demandes-du-suivi-qualite-et-des-escalades-pour-une-tranquillite-desprit-garantie"
            )}
            icon={Waves}
          />
          <WhyCard
            title={t("optimise")}
            content={t(
              "10-en-moyenne-grace-aux-offres-groupees-de-nos-partenaires"
            )}
            icon={Euro}
          />
        </div>
      </div>
    </section>
  );
};

export default ServicesLoader;
