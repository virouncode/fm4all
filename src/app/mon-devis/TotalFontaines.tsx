import { FontainesContext } from "@/context/FontainesProvider";
import { TotalFontainesContext } from "@/context/TotalFontainesProvider";
import { formatNumber } from "@/lib/formatNumber";
import { useContext } from "react";

const TotalFontaines = () => {
  const { fontaines } = useContext(FontainesContext);
  const { totalFontaines } = useContext(TotalFontainesContext);
  const total = totalFontaines.totalLotsFontaines
    .map(({ total }) => total ?? 0)
    .reduce((acc, curr) => acc + curr, 0);
  const totalInstallation = totalFontaines.totalLotsFontaines
    .map(({ totalInstallation }) => totalInstallation ?? 0)
    .reduce((acc, curr) => acc + curr, 0);

  if (!total) return null;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <div>Machines à Café ({fontaines.infos.nomFournisseur})</div>
        <div className="flex flex-col ml-4 text-xs ">
          {fontaines.lotsFontaines
            .filter(
              (item) =>
                totalFontaines.totalLotsFontaines.find(
                  ({ lotId }) => lotId === item.infos.lotId
                )?.total ?? 0 > 0
            )
            .map((item) => (
              <div key={item.infos.lotId} className="flex flex-col">
                <div
                  className="flex items-center justify-between 
                  )} font-bold"
                >
                  <p>
                    {item.quantites.nbFontaines} x {item.infos.marque}{" "}
                    {item.infos.modele}
                  </p>
                  <p>
                    {formatNumber(
                      totalFontaines.totalLotsFontaines.find(
                        (total) => total.lotId === item.infos.lotId
                      )?.total ?? 0
                    )}{" "}
                    € HT/an
                  </p>
                </div>
                {totalFontaines.totalLotsFontaines.find(
                  (total) => total.lotId === item.infos.lotId
                )?.totalInstallation ? (
                  <div className="flex items-center justify-between">
                    <p>Installation</p>
                    <p>
                      {formatNumber(
                        totalFontaines.totalLotsFontaines.find(
                          (total) => total.lotId === item.infos.lotId
                        )?.totalInstallation ?? 0
                      )}{" "}
                      € HT
                    </p>
                  </div>
                ) : null}
              </div>
            ))}
          <div className="flex flex-col border-t border-foreground mt-2">
            <div className="flex justify-between w-full">
              <p>TOTAL</p>
              <p className="text-end">{formatNumber(total)} € HT/an</p>
            </div>
            {totalInstallation ? (
              <div className="flex justify-between w-full">
                <p>TOTAL INSTALLATION</p>
                <p className="text-end">
                  {formatNumber(totalInstallation)} € HT
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalFontaines;
