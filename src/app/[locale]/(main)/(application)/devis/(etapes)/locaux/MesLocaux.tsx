"use client";

import { RhfControlledSelect } from "@/components/rhf/RhfControlledSelect";
import { RhfInput } from "@/components/rhf/RhfInput";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { SelectItem } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { typeBatimentCT, typeOccupationCT } from "@/constants/codeTables";
import { departements } from "@/constants/departements";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { useDevisProgressStore } from "@/stores/devis/devisProgressStore";
import { useProspectStore } from "@/stores/devis/prospectStore";
import { normalizeForSubmit } from "@/zod-helpers/normalize";
import {
  createMesLocauxFormSchema,
  MesLocauxFormType,
} from "@/zod-schemas/mesLocaux.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useShallow } from "zustand/shallow";
import { fullReinitialisationDevis } from "./fullReinitialisationDevis";
import { initialisationDevis } from "./initialisationDevis";
import ServicesLoader from "./ServicesLoader";

const MesLocaux = () => {
  const t = useTranslations("DevisPage.locaux.locauxForm");
  const tDevisButton = useTranslations("devisButton");
  const tErrors = useTranslations("DevisPage.locaux.locauxForm.erreurs");
  const [loading, setLoading] = useState(false);
  const { devisProgress, setDevisProgress } = useDevisProgressStore(
    useShallow((s) => ({
      devisProgress: s.devisProgress,
      setDevisProgress: s.setDevisProgress,
    })),
  );
  const prospect = useProspectStore((s) => s.prospect);
  const setProspect = useProspectStore((s) => s.setProspect);
  const [loaderVisible, setLoaderVisible] = useState(false);
  const router = useRouter();
  const [showModal, setShowModal] = useState(true);

  const serviceSearchParams = new URLSearchParams();
  const sauvegarderSearchParams = new URLSearchParams();

  if (prospect.effectif) {
    serviceSearchParams.set("effectif", prospect.effectif.toString());
    sauvegarderSearchParams.set("effectif", prospect.effectif.toString());
  }
  if (prospect.surface) {
    serviceSearchParams.set("surface", prospect.surface.toString());
    sauvegarderSearchParams.set("surface", prospect.surface.toString());
  }
  if (prospect.typeBatiment) {
    sauvegarderSearchParams.set("typeBatiment", prospect.typeBatiment);
  }
  if (prospect.typeOccupation) {
    sauvegarderSearchParams.set("typeOccupation", prospect.typeOccupation);
  }
  const devisRoutes: {
    id: number;
    pathname:
      | "/locaux"
      | "/services"
      | "/food-beverage"
      | "/pilotage"
      | "/sauvegarder"
      | "/personnaliser"
      | "/afficher";
    searchParams?: URLSearchParams;
  }[] = [
    { id: 1, pathname: "/locaux" },
    { id: 2, pathname: "/services", searchParams: serviceSearchParams },
    { id: 3, pathname: "/food-beverage" },
    { id: 4, pathname: "/pilotage", searchParams: serviceSearchParams },
    { id: 5, pathname: "/sauvegarder", searchParams: sauvegarderSearchParams },
    { id: 6, pathname: "/personnaliser" },
    { id: 7, pathname: "/afficher" },
  ];

  const defaultValues: MesLocauxFormType = {
    surface: prospect.surface != null ? prospect.surface.toString() : "",
    effectif: prospect.effectif != null ? prospect.effectif.toString() : "",
    typeBatiment: prospect.typeBatiment,
    typeOccupation: prospect.typeOccupation,
    codePostal: prospect.codePostal,
  };

  const form = useForm<MesLocauxFormType>({
    mode: "all",
    resolver: zodResolver(
      createMesLocauxFormSchema({
        surface: tErrors("surface"),
        effectif: tErrors("effectif"),
        batiment: tErrors("batiment"),
        occupation: tErrors("occupation"),
        codePostal: tErrors("codePostal"),
      }),
    ),
    defaultValues,
  });

  const submitForm = async (data: MesLocauxFormType) => {
    const payload = normalizeForSubmit(
      { ...data, ville: "" },
      {
        requiredNumbers: ["surface", "effectif"] as const,
      },
    );
    setLoading(true);

    try {
      const response = await fetch(
        `https://geo.api.gouv.fr/communes?codePostal=${payload.codePostal}`,
      );
      if (!response.ok) {
        throw new Error(`Geo API error: ${response.status}`);
      }

      const cityData = await response.json();

      if (cityData.length === 0) {
        setDevisProgress((prev) => ({ ...prev, completedSteps: [] }));
        toast.error(t("code-postal-invalide"), {
          description: t(
            "le-code-postal-ne-correspond-a-aucune-ville-veuillez-reessayer",
          ),
        });
        setLoading(false);
        return;
      }

      payload.ville = cityData[0].nom;
      setProspect((prev) => ({
        ...prev,
        ...payload,
      }));
    } catch (err) {
      console.error(err);
      toast.warning(t("ville-non-verifiee"), {
        description: t(
          "nous-navons-pas-pu-verifier-la-ville-mais-vous-pouvez-continuer-votre-devis",
        ),
      });
      setProspect((prev) => ({
        ...prev,
        ...payload,
        ville: "",
      }));
    } finally {
      setLoading(false);
    }

    if (
      !departements.find(({ id }) => id === payload.codePostal.substring(0, 2))
    ) {
      setDevisProgress((prev) => ({ ...prev, completedSteps: [] }));
      router.push({
        pathname: "/chalandise",
        query: {
          destination: "/",
          codePostal: payload.codePostal,
          ville: payload.ville, // peut être vide si catch, mais pas bloquant
          surface: payload.surface.toString(),
          effectif: payload.effectif.toString(),
          typeBatiment: payload.typeBatiment,
          typeOccupation: payload.typeOccupation,
        },
      });
      return;
    }

    // Réinitialisation de tous le devis
    initialisationDevis();
    setLoaderVisible(true);
    window.scrollTo(0, 0);

    const serviceSearchParams = new URLSearchParams();
    serviceSearchParams.set("effectif", payload.effectif.toString());
    serviceSearchParams.set("surface", payload.surface.toString());

    setTimeout(() => {
      router.push({
        pathname: "/devis/services",
        query: Object.fromEntries(serviceSearchParams.entries()),
      });
    }, 3000);
  };

  const handleClickNouveau = () => {
    fullReinitialisationDevis();
    const freshProspect = useProspectStore.getState().prospect;
    form.reset({
      surface:
        freshProspect.surface != null ? freshProspect.surface.toString() : "",
      effectif:
        freshProspect.effectif != null ? freshProspect.effectif.toString() : "",
      typeBatiment: freshProspect.typeBatiment ?? "",
      typeOccupation: freshProspect.typeOccupation ?? "",
      codePostal: freshProspect.codePostal ?? "",
    });
    setShowModal(false);
  };

  const handleClickReprendre = () => {
    const maxCompletedStep = Math.max(...devisProgress.completedSteps);
    const targetStep = maxCompletedStep + 1;
    const route =
      devisRoutes.find(({ id }) => id === targetStep) ??
      devisRoutes.find(({ id }) => id === maxCompletedStep) ??
      devisRoutes[0];

    setDevisProgress((prev) => ({ ...prev, currentStep: route.id }));
    router.push({
      pathname: `/devis${route.pathname}`,
      query: route.searchParams
        ? Object.fromEntries(route.searchParams.entries())
        : {},
    });
    setShowModal(false);
  };

  if (!loaderVisible && devisProgress.completedSteps.includes(1))
    return (
      <Dialog open={showModal} onOpenChange={() => {}}>
        <DialogContent
          className="w-5/6 rounded-xl sm:max-w-[425px] lg:w-auto [&>button]:hidden"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>{tDevisButton("devis-en-cours")}</DialogTitle>
            <DialogDescription>
              {tDevisButton(
                "un-devis-est-deja-en-cours-souhaitez-vous-le-reprendre-ou-en-creer-un-nouveau-vos-informations-seront-perdues",
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <div className="mx-auto flex justify-center gap-4">
              <Button onClick={handleClickNouveau}>
                {tDevisButton("nouveau")}
              </Button>
              <Button onClick={handleClickReprendre} variant="outline">
                {tDevisButton("reprendre")}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

  return !loaderVisible ? (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(submitForm)}
        className="mx-auto mt-6 flex w-full flex-col gap-14 p-1 md:mt-10 md:w-2/3"
      >
        <div className="flex flex-col md:flex-row md:gap-14">
          <div className="flex w-full flex-col gap-4 md:w-1/2">
            <RhfInput<MesLocauxFormType>
              label={t("code-postal")}
              name="codePostal"
              placeholder="XXXXX"
              data-testid="code-postal-input"
              autoFocus
              requiredMark
            />
            <RhfInput<MesLocauxFormType>
              label={t("surface-en-m")}
              name="surface"
              data-testid="surface-input"
              requiredMark
            />
            <RhfInput<MesLocauxFormType>
              label={t("nombre-moyen-de-personnes")}
              name="effectif"
              data-testid="effectif-input"
              requiredMark
            />
          </div>
          <div className="flex w-full flex-col gap-4 md:w-1/2">
            <RhfControlledSelect<MesLocauxFormType>
              label={t("type-de-batiment")}
              name="typeBatiment"
              data-testid="type-batiment-select"
              selectClassName="w-full"
            >
              {typeBatimentCT.map((tb) => (
                <SelectItem key={tb.code} value={tb.code}>
                  {t(tb.name)}
                </SelectItem>
              ))}
            </RhfControlledSelect>
            <RhfControlledSelect<MesLocauxFormType>
              label={t("type-doccupation")}
              name="typeOccupation"
              data-testid="type-occupation-select"
              selectClassName="w-full"
            >
              {typeOccupationCT.map((to) => (
                <SelectItem key={to.code} value={to.code}>
                  {t(to.name)}
                </SelectItem>
              ))}
            </RhfControlledSelect>
          </div>
        </div>
        <div className="flex justify-center">
          <Button
            size="lg"
            title={t("afficher-les-tarifs")}
            className="text-base"
            disabled={loading}
            data-testid="afficher-tarifs-button"
          >
            {loading && <Spinner />}
            {t("afficher-les-tarifs")}
          </Button>
        </div>
      </form>
    </Form>
  ) : (
    <ServicesLoader />
  );
};
export default MesLocaux;
