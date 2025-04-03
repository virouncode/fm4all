import { MARGE } from "@/constants/constants";
import { IncendieContext } from "@/context/IncendieProvider";
import { TotalIncendieContext } from "@/context/TotalIncendieProvider";
import { formatNumber } from "@/lib/formatNumber";
import { useTranslations } from "next-intl";
import { useContext } from "react";

const TotalIncendie = () => {
  const t = useTranslations("Total");
  const tPersonnaliser = useTranslations("DevisPage.personnaliser");
  const { incendie } = useContext(IncendieContext);
  const { totalIncendie } = useContext(TotalIncendieContext);
  const totalTrilogie = totalIncendie.totalTrilogie;
  const totalExutoires = totalIncendie.totalExutoires;
  const totalExutoiresParking = totalIncendie.totalExutoiresParking;
  const totalAlarmes = totalIncendie.totalAlarmes;
  const totalPortesCoupeFeuBattantes =
    totalIncendie.totalPortesCoupeFeuBattantes;
  const totalPortesCoupeFeuCoulissantes =
    totalIncendie.totalPortesCoupeFeuCoulissantes;
  const totalRIA = totalIncendie.totalRIA;
  const totalColonnesSechesStatiques =
    totalIncendie.totalColonnesSechesStatiques;
  const totalColonnesSechesDynamiques =
    totalIncendie.totalColonnesSechesDynamiques;
  const totalDeplacementTrilogie = !totalTrilogie
    ? 0
    : totalIncendie.totalDeplacementTrilogie;
  const totalDeplacementExutoires = !totalExutoires
    ? 0
    : totalIncendie.totalDeplacementExutoires;
  const totalDeplacementExutoiresParking = !totalExutoiresParking
    ? 0
    : totalIncendie.totalDeplacementExutoiresParking;
  const total =
    (totalTrilogie || 0) +
    (totalDeplacementTrilogie || 0) +
    (totalExutoires || 0) +
    (totalDeplacementExutoires || 0) +
    (totalExutoiresParking || 0) +
    (totalDeplacementExutoiresParking || 0) +
    (totalAlarmes || 0) +
    (totalRIA || 0) +
    (totalPortesCoupeFeuBattantes || 0) +
    (totalPortesCoupeFeuCoulissantes || 0) +
    (totalColonnesSechesStatiques || 0) +
    (totalColonnesSechesDynamiques || 0);

  if (!total) return null;

  return (
    <div className="flex flex-col gap-4 total-section" id="total-incendie">
      <div className="flex flex-col gap-4">
        <div>
          {t("securite-incendie")} ({incendie.infos.nomFournisseur})
        </div>
        <div className="flex flex-col ml-4 text-xs ">
          {totalTrilogie ? (
            <div className="flex items-center justify-between font-bold">
              <p>{t("trilogie-extincteurs-baes-telecommandes")}</p>
              <p className="text-end">
                {formatNumber(Math.round(totalTrilogie * MARGE))}{" "}
                {t("eur-ht-an")}
              </p>
            </div>
          ) : null}
          {totalDeplacementTrilogie ? (
            <div className="flex items-center justify-between font-bold">
              <p>{t("frais-de-deplacement")}</p>
              <p className="text-end">
                {formatNumber(Math.round(totalDeplacementTrilogie * MARGE))}{" "}
                {t("eur-ht-an")}
              </p>
            </div>
          ) : null}
          {totalExutoires ? (
            <div className="flex items-center justify-between font-bold">
              <p>{tPersonnaliser("exutoires-de-fumee")}</p>
              <p className="text-end">
                {formatNumber(Math.round(totalExutoires * MARGE))}{" "}
                {t("eur-ht-an")}
              </p>
            </div>
          ) : null}
          {totalDeplacementExutoires ? (
            <div className="flex items-center justify-between font-bold">
              <p>{t("frais-de-deplacement")}</p>
              <p className="text-end">
                {formatNumber(Math.round(totalDeplacementExutoires * MARGE))}{" "}
                {t("eur-ht-an")}
              </p>
            </div>
          ) : null}
          {totalExutoiresParking ? (
            <div className="flex items-center justify-between font-bold">
              <p>{tPersonnaliser("exutoires-de-fumee-parking")}</p>
              <p className="text-end">
                {formatNumber(Math.round(totalExutoiresParking * MARGE))}{" "}
                {t("eur-ht-an")}
              </p>
            </div>
          ) : null}
          {totalDeplacementExutoiresParking ? (
            <div className="flex items-center justify-between font-bold">
              <p>{t("frais-de-deplacement")}</p>
              <p className="text-end">
                {formatNumber(
                  Math.round(totalDeplacementExutoiresParking * MARGE)
                )}{" "}
                {t("eur-ht-an")}
              </p>
            </div>
          ) : null}
          {totalAlarmes ? (
            <div className="flex items-center justify-between font-bold">
              <p>{t("alarmes-t4-ssi")}</p>
              <p className="text-end">
                {formatNumber(Math.round(totalAlarmes * MARGE))}{" "}
                {t("eur-ht-an")}
              </p>
            </div>
          ) : null}
          {totalRIA ? (
            <div className="flex items-center justify-between font-bold">
              <p>{tPersonnaliser("robinets-dincendie-armes")}</p>
              <p className="text-end">
                {formatNumber(Math.round(totalRIA * MARGE))} {t("eur-ht-an")}
              </p>
            </div>
          ) : null}
          {totalPortesCoupeFeuBattantes ? (
            <div className="flex items-center justify-between font-bold">
              <p>{tPersonnaliser("portes-coupe-feu-battantes")}</p>
              <p className="text-end">
                {formatNumber(Math.round(totalPortesCoupeFeuBattantes * MARGE))}{" "}
                {t("eur-ht-an")}
              </p>
            </div>
          ) : null}
          {totalPortesCoupeFeuCoulissantes ? (
            <div className="flex items-center justify-between font-bold">
              <p>{tPersonnaliser("portes-coupe-feu-coulissantes")}</p>
              <p className="text-end">
                {formatNumber(
                  Math.round(totalPortesCoupeFeuCoulissantes * MARGE)
                )}{" "}
                {t("eur-ht-an")}
              </p>
            </div>
          ) : null}
          {totalColonnesSechesStatiques ? (
            <div className="flex items-center justify-between font-bold">
              <p>{tPersonnaliser("colonnes-seches-statiques")}</p>
              <p className="text-end">
                {formatNumber(Math.round(totalColonnesSechesStatiques * MARGE))}{" "}
                {t("eur-ht-an")}
              </p>
            </div>
          ) : null}
          {totalColonnesSechesDynamiques ? (
            <div className="flex items-center justify-between font-bold">
              <p>{tPersonnaliser("colonnes-seches-dynamiques")}</p>
              <p className="text-end">
                {formatNumber(
                  Math.round(totalColonnesSechesDynamiques * MARGE)
                )}{" "}
                {t("eur-ht-an")}
              </p>
            </div>
          ) : null}
          <div className="flex items-center justify-between border-t border-foreground mt-2">
            <p>TOTAL</p>
            <p className="text-end">
              {formatNumber(Math.round(total * MARGE))} {t("eur-ht-an")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalIncendie;
