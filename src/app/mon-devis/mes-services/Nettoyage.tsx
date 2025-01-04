import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SprayCan } from "lucide-react";
import NextServiceButton from "./NextServiceButton";
import PreviousServiceButton from "./PreviousServiceButton";

type NettoyageProps = {
  handleClickNext: () => void;
  handleClickPrevious: () => void;
  selectedServicesIds: number[];
};

const Nettoyage = ({
  handleClickNext,
  handleClickPrevious,
  selectedServicesIds,
}: NettoyageProps) => {
  return (
    <div className="flex flex-col gap-6 w-full mx-auto h-[600px] py-2" id="1">
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center border py-2 px-4 rounded-xl border-fm4allsecondary text-fm4allsecondary bg-fm4allsecondary/20">
          <SprayCan />
          <p className="text-base">Nettoyage et propreté</p>
        </div>
        <PreviousServiceButton handleClickPrevious={handleClickPrevious} />
      </div>
      <Tabs defaultValue="nettoyage" className="w-full flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="nettoyage" className="text-base">
            Nettoyage
          </TabsTrigger>
          <TabsTrigger value="consommables" className="text-base">
            Consommables
          </TabsTrigger>
          <TabsTrigger value="options" className="text-base">
            Options
          </TabsTrigger>
        </TabsList>
        <TabsContent value="nettoyage" className="flex-1">
          <div className="h-full flex flex-col border rounded-xl overflow-hidden">
            <div className="flex border-b flex-1">
              <div className="flex w-1/4 items-center justify-center">
                Entreprise 1
              </div>
              <div className="flex w-1/4 bg-fm4allessential text-slate-200 items-center justify-center">
                Essentiel
              </div>
              <div className="flex w-1/4 bg-fm4allcomfort text-slate-200 items-center justify-center">
                Confort
              </div>
              <div className="flex w-1/4 bg-fm4allexcellence text-slate-200 items-center justify-center">
                Excellence
              </div>
            </div>
            <div className="flex border-b flex-1">
              <div className="flex w-1/4 items-center justify-center">
                Entreprise 2
              </div>
              <div className="flex w-1/4 items-center justify-center bg-fm4allessential text-slate-200">
                Essentiel
              </div>
              <div className="flex w-1/4 items-center justify-center bg-fm4allcomfort text-slate-200">
                Confort
              </div>
              <div className="flex w-1/4 items-center justify-center bg-fm4allexcellence text-slate-200">
                Excellence
              </div>
            </div>
            <div className="flex border-b flex-1">
              <div className="flex w-1/4 items-center justify-center">
                Entreprise 3
              </div>
              <div className="flex w-1/4 items-center justify-center bg-fm4allessential text-slate-200">
                Essentiel
              </div>
              <div className="flex w-1/4 items-center justify-center bg-fm4allcomfort text-slate-200">
                Confort
              </div>
              <div className="flex w-1/4 items-center justify-center bg-fm4allexcellence text-slate-200">
                Excellence
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="consommables" className="flex-1">
          <div className="h-full flex flex-col border rounded-xl overflow-hidden">
            <div className="flex border-b flex-1">
              <div className="flex w-1/4 items-center justify-center">
                Entreprise 1
              </div>
              <div className="flex w-1/4 bg-fm4allessential text-slate-200 items-center justify-center">
                Essentiel
              </div>
              <div className="flex w-1/4 bg-fm4allcomfort text-slate-200 items-center justify-center">
                Confort
              </div>
              <div className="flex w-1/4 bg-fm4allexcellence text-slate-200 items-center justify-center">
                Excellence
              </div>
            </div>
            <div className="flex border-b flex-1">
              <div className="flex w-1/4 items-center justify-center">
                Entreprise 2
              </div>
              <div className="flex w-1/4 items-center justify-center bg-fm4allessential text-slate-200">
                Essentiel
              </div>
              <div className="flex w-1/4 items-center justify-center bg-fm4allcomfort text-slate-200">
                Confort
              </div>
              <div className="flex w-1/4 items-center justify-center bg-fm4allexcellence text-slate-200">
                Excellence
              </div>
            </div>
            <div className="flex border-b flex-1">
              <div className="flex w-1/4 items-center justify-center">
                Entreprise 3
              </div>
              <div className="flex w-1/4 items-center justify-center bg-fm4allessential text-slate-200">
                Essentiel
              </div>
              <div className="flex w-1/4 items-center justify-center bg-fm4allcomfort text-slate-200">
                Confort
              </div>
              <div className="flex w-1/4 items-center justify-center bg-fm4allexcellence text-slate-200">
                Excellence
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="options" className="flex-1">
          <div className="h-full flex flex-col border rounded-xl overflow-hidden">
            <div className="flex border-b flex-1">
              <div className="flex w-1/4 items-center justify-center">
                Entreprise 1
              </div>
              <div className="flex w-1/4 bg-fm4allessential text-slate-200 items-center justify-center">
                Essentiel
              </div>
              <div className="flex w-1/4 bg-fm4allcomfort text-slate-200 items-center justify-center">
                Confort
              </div>
              <div className="flex w-1/4 bg-fm4allexcellence text-slate-200 items-center justify-center">
                Excellence
              </div>
            </div>
            <div className="flex border-b flex-1">
              <div className="flex w-1/4 items-center justify-center">
                Entreprise 2
              </div>
              <div className="flex w-1/4 items-center justify-center bg-fm4allessential text-slate-200">
                Essentiel
              </div>
              <div className="flex w-1/4 items-center justify-center bg-fm4allcomfort text-slate-200">
                Confort
              </div>
              <div className="flex w-1/4 items-center justify-center bg-fm4allexcellence text-slate-200">
                Excellence
              </div>
            </div>
            <div className="flex border-b flex-1">
              <div className="flex w-1/4 items-center justify-center">
                Entreprise 3
              </div>
              <div className="flex w-1/4 items-center justify-center bg-fm4allessential text-slate-200">
                Essentiel
              </div>
              <div className="flex w-1/4 items-center justify-center bg-fm4allcomfort text-slate-200">
                Confort
              </div>
              <div className="flex w-1/4 items-center justify-center bg-fm4allexcellence text-slate-200">
                Excellence
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      {selectedServicesIds[selectedServicesIds.length - 1] === 1 ? null : (
        <NextServiceButton handleClickNext={handleClickNext} />
      )}
    </div>
  );
};

export default Nettoyage;
