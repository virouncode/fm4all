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
    <div className="flex-wrap gap-10 justify-center text-2xl mb-4 hidden lg:flex">
      <div
        className={`flex gap-2 w-48  px-6 py-10 bg-fm4allessential rounded-lg text-slate-200 font-bold justify-center`}
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
                <p className={`text-fm4allessential text-center`}>
                  {tGlobal("essentiel")}
                </p>
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col text-base my-4 hyphens-auto">
              {t(
                "vous-etes-en-recherche-de-services-efficaces-et-optimises-ce-qui-est-important-pour-vous-c-est-d-etre-en-regle-et-d-apporter-ce-qui-est-essentiel-pour-votre-site"
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div
        className={`flex gap-2 w-48  px-6 py-10 bg-fm4allcomfort rounded-lg text-slate-200 font-bold justify-center`}
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
                <p className={`text-fm4allcomfort text-center`}>
                  {tGlobal("confort")}
                </p>
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col text-base my-4 hyphens-auto">
              {t(
                "vous-etes-en-recherche-du-bon-rapport-qualite-prix-le-strict-minimum-vous-semble-un-peu-juste-pour-cette-prestation-et-vous-cherchez-le-bon-equilibre-dans-cette-formule-tout-est-gere-cle-en-main-sans-contraintes"
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div
        className={`flex gap-2 w-48  px-6 py-10 bg-fm4allexcellence rounded-lg text-slate-200 font-bold justify-center`}
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
                <p className={`text-fm4allexcellence text-center`}>
                  {tGlobal("excellence")}
                </p>
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col text-base my-4 hyphens-auto">
              {t(
                "le-bien-etre-au-travail-c-est-important-vous-investissez-sur-les-services-envers-vos-collaborateurs-car-ils-vous-le-rendent-bien-l-excellence-de-service-vous-donne-tranquillite-d-esprit"
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MesServicesPresentationGammes;
