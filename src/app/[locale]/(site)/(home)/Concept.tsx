import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Handshake, Scale, ScrollText } from "lucide-react";
import { getTranslations } from "next-intl/server";

const Concept = async () => {
  const t = await getTranslations("HomePage.concept");
  return (
    <section id="presentation">
      <div className="bg-gradient-to-r from-[#f0c674]/100 to-[#f0c674]/70">
        <div className="max-w-7xl w-full mx-auto flex flex-col gap-10 pt-8 pb-12 px-6">
          <h2 className="text-2xl md:text-3xl border-l-2 px-4">
            {t("notre-concept")}
          </h2>
          <div className="flex flex-col lg:flex-row justify-center gap-8 lg:px-14">
            <Card className="w-full lg:w-1/3 p-4">
              <CardHeader>
                <CardTitle className="flex flex-col items-center justify-center gap-4">
                  <Scale size={40} />
                  <p className="text-2xl text-center">{t("un-comparateur")}</p>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                {t("pour-chaque-service")}{" "}
                <strong>
                  {t("comparez-les-offres-de-nos-prestataires-partenaires")}
                </strong>{" "}
                {t("et-trouvez-la-formule-qui-vous-convient-le-mieux")}
              </CardContent>
            </Card>
            <Card className="w-full lg:w-1/3 p-4">
              <CardHeader>
                <CardTitle className="flex flex-col items-center justify-center gap-4">
                  <ScrollText size={40} />
                  <p className="text-2xl text-center">
                    {t("un-generateur-de-devis")}
                  </p>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                {t("obtenez-un")}{" "}
                <strong>{t("devis-clair-et-detaille")}</strong>{" "}
                {t("en-quelques-clics-sans-attendre-un-hypothetique-appel")}
              </CardContent>
            </Card>
            <Card className="w-full lg:w-1/3 p-4">
              <CardHeader>
                <CardTitle className="flex flex-col items-center justify-center gap-4">
                  <Handshake size={40} />
                  <p className="text-2xl text-center">
                    {t("un-accompagnement")}
                  </p>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                {t(
                  "cahier-des-charges-contrats-factures-planification-nous-gerons-tout-cela-pour-vous"
                )}{" "}
                <strong>{t("1-contact-1-contrat-1-facture")}</strong>{" "}
                {t("pour-tous-vos-services")}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Concept;
