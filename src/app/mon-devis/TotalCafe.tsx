import { CafeContext } from "@/context/CafeProvider";
import { TotalCafeContext } from "@/context/TotalCafeProvider";
import { formatNumber } from "@/lib/formatNumber";
import { getFm4AllColor } from "@/lib/getFm4AllColor";
import { useContext } from "react";

const TotalCafe = () => {
  const { cafe } = useContext(CafeContext);
  const { totalCafe } = useContext(TotalCafeContext);
  const total = totalCafe.totalEspaces
    .map(({ total }) => total ?? 0)
    .reduce((acc, curr) => acc + curr, 0);
  const totalInstallation = totalCafe.totalEspaces
    .map(({ totalInstallation }) => totalInstallation ?? 0)
    .reduce((acc, curr) => acc + curr, 0);

  if (!total) return null;
  return (
    <div className="flex flex-col gap-4 total-section" id="total-cafe">
      <div className="flex flex-col gap-4">
        <div>Machines à Café ({cafe.infos.nomFournisseur})</div>
        <div className="flex flex-col ml-4 text-xs ">
          {cafe.espaces
            .filter(
              (item) =>
                totalCafe.totalEspaces.find(
                  ({ espaceId }) => espaceId === item.infos.espaceId
                )?.total ?? 0 > 0
            )
            .map((item) => (
              <div key={item.infos.espaceId} className="flex flex-col">
                <div
                  className={`flex items-center justify-between text-${getFm4AllColor(
                    item.infos.gammeCafeSelected
                  )} font-bold`}
                >
                  <p>
                    {item.quantites.nbMachines} x {item.infos.marque}{" "}
                    {item.infos.modele}
                  </p>
                  <p>
                    {formatNumber(
                      Math.round(
                        totalCafe.totalEspaces.find(
                          (total) => total.espaceId === item.infos.espaceId
                        )?.total ?? 0
                      )
                    )}{" "}
                    € HT/an
                  </p>
                </div>
                {totalCafe.totalEspaces.find(
                  (total) => total.espaceId === item.infos.espaceId
                )?.totalInstallation ? (
                  <div className="flex items-center justify-between">
                    <p>Installation</p>
                    <p>
                      {formatNumber(
                        Math.round(
                          totalCafe.totalEspaces.find(
                            (total) => total.espaceId === item.infos.espaceId
                          )?.totalInstallation ?? 0
                        )
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
              <p className="text-end">
                {formatNumber(Math.round(total))} € HT/an
              </p>
            </div>
            {totalInstallation ? (
              <div className="flex justify-between w-full">
                <p>TOTAL INSTALLATION</p>
                <p className="text-end">
                  {formatNumber(Math.round(totalInstallation))} € HT
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalCafe;
