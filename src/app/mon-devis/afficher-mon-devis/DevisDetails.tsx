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
  return (
    <div className="flex flex-col gap-4 w-[1360px] mx-auto absolute -translate-x-[3000px]">
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
      <DetailServicesFm4All />
    </div>
  );
};

export default DevisDetails;
