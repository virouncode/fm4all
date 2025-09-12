import PropositionsTitleMobile from "@/app/[locale]/(main)/(application)/devis/PropositionsTitleMobile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PersonnalisationContext } from "@/context/PersonnalisationProvider";
import { TotalNettoyageContext } from "@/context/TotalNettoyageProvider";
import { useNettoyageStore } from "@/stores/nettoyageStore";
import { SprayCan } from "lucide-react";
import { useTranslations } from "next-intl";
import { ChangeEvent, useContext, useRef } from "react";
import { useMediaQuery } from "react-responsive";
import PropositionsFooter from "../../../PropositionsFooter";
import PropositionsTitle from "../../../PropositionsTitle";

const PersonnaliserNettoyageVitrerie = () => {
  const t = useTranslations("DevisPage.services.presentation.cards");
  const tPersonnaliser = useTranslations("DevisPage.personnaliser");
  const client = useClientStore((s) => s.client);
  const { nettoyage, setNettoyage } = useNettoyageStore();
  const { setTotalNettoyage } = useContext(TotalNettoyageContext);
  const { personnalisation, setPersonnalisation } = useContext(
    PersonnalisationContext,
  );
  const handleClickPrevious = () => {};
  const handleClickNext = () => {
    const currentIndex = personnalisation.personnalisationIds.indexOf(2);
    setPersonnalisation((prev) => ({
      ...prev,
      currentPersonnalisationId: prev.personnalisationIds[currentIndex + 1],
    }));
  };
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;
    const tauxHoraireVitrerie = nettoyage.prix.tauxHoraireVitrerie;
    const cadenceVitres = nettoyage.quantites.cadenceVitres;
    const cadenceCloisons = nettoyage.quantites.cadenceCloisons;
    const nbPassagesVitrerie = nettoyage.quantites.nbPassagesVitrerie;
    const minFacturationVitrerie = nettoyage.prix.minFacturationVitrerie;
    const newSurface = value ? parseInt(value) : (client.surface ?? 0) * 0.15;
    if (name === "vitres") {
      const surfaceCloisons = nettoyage.quantites.surfaceCloisons;
      const totalVitrerieParPassage =
        cadenceVitres !== null &&
        cadenceVitres !== null &&
        surfaceCloisons !== null &&
        cadenceCloisons !== null &&
        tauxHoraireVitrerie !== null
          ? Math.max(
              (newSurface / cadenceVitres + surfaceCloisons / cadenceCloisons) *
                tauxHoraireVitrerie,
              minFacturationVitrerie ?? 0,
            )
          : null;

      const totalVitrerie =
        totalVitrerieParPassage !== null
          ? nbPassagesVitrerie * totalVitrerieParPassage
          : null;

      setNettoyage((prev) => ({
        ...prev,
        quantites: {
          ...prev.quantites,
          surfaceVitres: newSurface,
        },
      }));
      setTotalNettoyage((prev) => ({ ...prev, totalVitrerie }));
    } else if (name === "cloisons") {
      const surfaceVitres = nettoyage.quantites.surfaceVitres;
      const totalVitrerieParPassage =
        cadenceVitres !== null &&
        cadenceVitres !== null &&
        surfaceVitres !== null &&
        cadenceCloisons !== null &&
        tauxHoraireVitrerie !== null
          ? Math.max(
              (surfaceVitres / cadenceVitres + newSurface / cadenceCloisons) *
                tauxHoraireVitrerie,
              minFacturationVitrerie ?? 0,
            )
          : null;
      const totalVitrerie =
        totalVitrerieParPassage !== null
          ? nbPassagesVitrerie * totalVitrerieParPassage
          : null;
      setNettoyage((prev) => ({
        ...prev,
        quantites: {
          ...prev.quantites,
          surfaceCloisons: newSurface,
        },
      }));
      setTotalNettoyage((prev) => ({ ...prev, totalVitrerie }));
    }
  };
  const handleChangePleinPied = (value: string) => {
    setNettoyage((prev) => ({
      ...prev,
      infos: { ...prev.infos, plainPied: value === "oui" ? true : false },
    }));
  };

  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });
  const propositionsRef = useRef<HTMLDivElement>(null);

  return (
    <div className="mx-auto flex h-full w-full flex-col gap-4 py-2" id="2">
      {isTabletOrMobile ? (
        <PropositionsTitleMobile
          title={t("nettoyage-et-proprete")}
          description=""
          icon={SprayCan}
          propositionsRef={propositionsRef}
        />
      ) : (
        <PropositionsTitle
          title={t("nettoyage-et-proprete")}
          description=""
          icon={SprayCan}
          handleClickPrevious={handleClickPrevious}
          previousButton={false}
        />
      )}
      <div
        className="mb-6 flex w-full flex-1 flex-col gap-6"
        ref={propositionsRef}
      >
        <div className="flex flex-col gap-6">
          <p className="text-2xl">
            {tPersonnaliser("nettoyage-de-la-vitrerie")}
          </p>
          <p className="mx-auto max-w-prose hyphens-auto">
            {tPersonnaliser(
              "nous-avions-estime-la-surface-de-vos-vitres-et-de-vos-cloisons-vitrees-a-15-de-la-surface-de-vos-locaux",
            )}
          </p>
          <div className="flex flex-col gap-4">
            <p className="mx-auto max-w-prose font-bold hyphens-auto">
              {tPersonnaliser(
                "vous-pouvez-renseigner-les-dimensions-exactes-si-vous-les-connaissez",
              )}
            </p>
            <div className="flex items-center justify-center gap-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="vitres" className="text-base">
                  {tPersonnaliser("surface-vitres-interieures-m")}
                  <sup>2</sup>
                </Label>
                <Input
                  value={nettoyage.quantites.surfaceVitres ?? 0}
                  onChange={handleChange}
                  name="vitres"
                  id="vitres"
                  type="number"
                  min={1}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="cloisons" className="text-base">
                  {tPersonnaliser("surface-cloisons-vitrees-m")}
                  <sup>2</sup>
                </Label>
                <Input
                  value={nettoyage.quantites.surfaceCloisons ?? 0}
                  onChange={handleChange}
                  name="cloisons"
                  id="cloisons"
                  type="number"
                  min={1}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <p className="mx-auto max-w-prose font-bold hyphens-auto">
              {tPersonnaliser(
                "la-vitrerie-est-elle-totalement-accessible-de-plain-pied",
              )}
            </p>
            <div className="flex items-center justify-center gap-14">
              <RadioGroup
                onValueChange={handleChangePleinPied}
                value={nettoyage.infos.plainPied ? "oui" : "non"}
                className="flex items-center gap-10"
                name="plainPied"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    value={"oui"}
                    title={tPersonnaliser("oui")}
                    id="oui"
                  />
                  <Label htmlFor="oui">{tPersonnaliser("oui")}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    value={"non"}
                    title={tPersonnaliser("non")}
                    id="non"
                  />
                  <Label htmlFor="non">{tPersonnaliser("non")}</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>
      </div>
      {!isTabletOrMobile ? (
        <PropositionsFooter handleClickNext={handleClickNext} />
      ) : null}
    </div>
  );
};

export default PersonnaliserNettoyageVitrerie;
