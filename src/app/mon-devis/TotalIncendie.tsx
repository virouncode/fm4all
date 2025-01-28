import { IncendieContext } from "@/context/IncendieProvider";
import { TotalIncendieContext } from "@/context/TotalIncendieProvider";
import { formatNumber } from "@/lib/formatNumber";
import { useContext } from "react";

const TotalIncendie = () => {
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
  const totalDeplacementTrilogie = totalIncendie.totalDeplacementTrilogie;
  const totalDeplacementExutoires = totalIncendie.totalDeplacementExutoires;
  const totalDeplacementExutoiresParking =
    totalIncendie.totalDeplacementExutoiresParking;
  const total = Object.values(totalIncendie)
    .filter((item) => item !== null)
    .reduce((sum, value) => sum + value, 0);

  if (!total) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <div>Securité Incendie ({incendie.infos.nomFournisseur})</div>
        <div className="flex flex-col ml-4 text-xs ">
          {totalTrilogie ? (
            <div className="flex items-center justify-between font-bold">
              <p>Trilogie Extincteurs / BAES / Télécommandes BAES</p>
              <p className="text-end">{formatNumber(totalTrilogie)} € HT/an</p>
            </div>
          ) : null}
          {totalDeplacementTrilogie ? (
            <div className="flex items-center justify-between font-bold">
              <p>Frais de déplacement</p>
              <p className="text-end">
                {formatNumber(totalDeplacementTrilogie)} € HT/an
              </p>
            </div>
          ) : null}
          {totalExutoires ? (
            <div className="flex items-center justify-between font-bold">
              <p>Exutoires de fumée</p>
              <p className="text-end">{formatNumber(totalExutoires)} € HT/an</p>
            </div>
          ) : null}
          {totalDeplacementExutoires ? (
            <div className="flex items-center justify-between font-bold">
              <p>Frais de déplacement</p>
              <p className="text-end">
                {formatNumber(totalDeplacementExutoires)} € HT/an
              </p>
            </div>
          ) : null}
          {totalExutoiresParking ? (
            <div className="flex items-center justify-between font-bold">
              <p>Exutoires de fumée (parking)</p>
              <p className="text-end">
                {formatNumber(totalExutoiresParking)} € HT/an
              </p>
            </div>
          ) : null}
          {totalDeplacementExutoiresParking ? (
            <div className="flex items-center justify-between font-bold">
              <p>Frais de déplacement</p>
              <p className="text-end">
                {formatNumber(totalDeplacementExutoiresParking)} € HT/an
              </p>
            </div>
          ) : null}
          {totalAlarmes ? (
            <div className="flex items-center justify-between font-bold">
              <p>Alarmes T4 / SSI</p>
              <p className="text-end">{formatNumber(totalAlarmes)} € HT/an</p>
            </div>
          ) : null}
          {totalRIA ? (
            <div className="flex items-center justify-between font-bold">
              <p>RIA</p>
              <p className="text-end">{formatNumber(totalRIA)} € HT/an</p>
            </div>
          ) : null}
          {totalPortesCoupeFeuBattantes ? (
            <div className="flex items-center justify-between font-bold">
              <p>Portes coupe-feu battantes</p>
              <p className="text-end">
                {formatNumber(totalPortesCoupeFeuBattantes)} € HT/an
              </p>
            </div>
          ) : null}
          {totalPortesCoupeFeuCoulissantes ? (
            <div className="flex items-center justify-between font-bold">
              <p>Portes coupe-feu coulissantes</p>
              <p className="text-end">
                {formatNumber(totalPortesCoupeFeuCoulissantes)} € HT/an
              </p>
            </div>
          ) : null}
          {totalColonnesSechesStatiques ? (
            <div className="flex items-center justify-between font-bold">
              <p>Colonnes sèches statiques</p>
              <p className="text-end">
                {formatNumber(totalColonnesSechesStatiques)} € HT/an
              </p>
            </div>
          ) : null}
          {totalColonnesSechesDynamiques ? (
            <div className="flex items-center justify-between font-bold">
              <p>Colonnes sèches dynamiques</p>
              <p className="text-end">
                {formatNumber(totalColonnesSechesDynamiques)} € HT/an
              </p>
            </div>
          ) : null}
          <div className="flex items-center justify-between border-t border-foreground mt-2">
            <p>TOTAL</p>
            <p className="text-end">{formatNumber(total)} € HT/an</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalIncendie;
