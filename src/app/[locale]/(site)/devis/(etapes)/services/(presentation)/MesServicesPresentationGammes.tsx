import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";

const MesServicesPresentationGammes = () => {
  const tGlobal = useTranslations("Global");
  const t = useTranslations("DevisPage.services.presentation.gammes");
  return (
    <div className="mb-4 hidden flex-wrap justify-center gap-10 text-2xl lg:flex">
      <div
        className={`flex w-48 justify-center gap-2 rounded-lg bg-fm4allessential px-6 py-10 font-bold text-slate-200`}
      >
        <p>{tGlobal("essentiel")}</p>
        <Dialog>
          <DialogTrigger asChild>
            <Info
              size={16}
              className="cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            />
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                <p className={`text-center text-fm4allessential`}>
                  {tGlobal("essentiel")}
                </p>
              </DialogTitle>
            </DialogHeader>
            <div className="my-4 flex flex-col hyphens-auto text-base">
              {t(
                "vous-etes-en-recherche-de-services-efficaces-et-optimises-ce-qui-est-important-pour-vous-c-est-d-etre-en-regle-et-d-apporter-ce-qui-est-essentiel-pour-votre-site",
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div
        className={`flex w-48 justify-center gap-2 rounded-lg bg-fm4allcomfort px-6 py-10 font-bold text-slate-200`}
      >
        <p>{tGlobal("confort")}</p>
        <Dialog>
          <DialogTrigger asChild>
            <Info
              size={16}
              className="cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            />
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                <p className={`text-center text-fm4allcomfort`}>
                  {tGlobal("confort")}
                </p>
              </DialogTitle>
            </DialogHeader>
            <div className="my-4 flex flex-col hyphens-auto text-base">
              {t(
                "vous-etes-en-recherche-du-bon-rapport-qualite-prix-le-strict-minimum-vous-semble-un-peu-juste-pour-cette-prestation-et-vous-cherchez-le-bon-equilibre-dans-cette-formule-tout-est-gere-cle-en-main-sans-contraintes",
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div
        className={`flex w-48 justify-center gap-2 rounded-lg bg-fm4allexcellence px-6 py-10 font-bold text-slate-200`}
      >
        <p>{tGlobal("excellence")}</p>
        <Dialog>
          <DialogTrigger asChild>
            <Info
              size={16}
              className="cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            />
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                <p className={`text-center text-fm4allexcellence`}>
                  {tGlobal("excellence")}
                </p>
              </DialogTitle>
            </DialogHeader>
            <div className="my-4 flex flex-col hyphens-auto text-base">
              {t(
                "le-bien-etre-au-travail-c-est-important-vous-investissez-sur-les-services-envers-vos-collaborateurs-car-ils-vous-le-rendent-bien-l-excellence-de-service-vous-donne-tranquillite-d-esprit",
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MesServicesPresentationGammes;
