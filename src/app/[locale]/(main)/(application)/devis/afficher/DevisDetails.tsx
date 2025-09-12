"use client";

import { useTotalStore } from "@/stores/totalStore";
import DetailCafe from "./DetailCafe";
import DetailFontaines from "./DetailFontaines";
import DetailHygiene from "./DetailHygiene";
import DetailIncendie from "./DetailIncendie";
import DetailMaintenance from "./DetailMaintenance";
import DetailNettoyage from "./DetailNettoyage";
import DetailOfficeManager from "./DetailOfficeManager";
import DetailSnacksFruits from "./DetailSnacksFruits";
import DetailServicesFm4All from "./DetailsServicesFm4All";
import DetailThe from "./DetailThe";

const DevisDetails = () => {
  const total = useTotalStore((s) => s.total);
  return (
    <div className="absolute mx-auto flex w-[1360px] -translate-x-[3000px] flex-col gap-4">
      {/* <DetailInfos /> */}
      <DetailNettoyage />
      <DetailHygiene />
      <DetailMaintenance />
      <DetailIncendie />
      <DetailCafe />
      <DetailThe />
      <DetailSnacksFruits />
      <DetailFontaines />
      <DetailOfficeManager />
      {total.totalAnnuelHtSansServicesFm4all ? <DetailServicesFm4All /> : null}
    </div>
  );
};

export default DevisDetails;
