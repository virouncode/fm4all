"use client";

import { ServicesContext } from "@/context/ServicesProvider";
import {
  Banana,
  Coffee,
  Cookie,
  CupSoda,
  FireExtinguisher,
  HandPlatter,
  Leaf,
  SprayCan,
  Toilet,
  UserRoundCog,
  Wrench,
} from "lucide-react";
import { useContext } from "react";
import NextServiceButton from "../NextServiceButton";

const MesServicesPresentation = () => {
  const { setServices } = useContext(ServicesContext);
  const handleClickNext = () => {
    setServices((prev) => ({
      ...prev,
      currentServiceId: 1,
    }));
  };
  return (
    <div className="flex flex-col gap-4 w-full mx-auto h-full py-2" id="0">
      <div className="w-full flex-1 overflow-auto">
        <div className="h-full flex flex-col gap-6">
          <p>
            Nous allons vous proposer plus de 3 devis pour chacun des services
            suivants :
          </p>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6 items-center">
            <div className="flex gap-4 items-center p-4 border rounded-xl">
              <div className="flex items-center gap-1">
                <SprayCan />
              </div>
              <p>Nettoyage et propreté</p>
            </div>
            <div className="flex gap-4 items-center p-4 border rounded-xl">
              <div className="flex items-center gap-1">
                <Toilet />
              </div>
              <p>Hygiène sanitaire</p>
            </div>
            <div className="flex gap-4 items-center p-4 border rounded-xl">
              <div className="flex items-center gap-1">
                <Wrench />
              </div>
              <p>Maintenance</p>
            </div>
            <div className="flex gap-4 items-center p-4 border rounded-xl">
              <div className="flex items-center gap-1">
                <FireExtinguisher />
              </div>
              <p>Sécurité incendie</p>
            </div>
            <div className="flex gap-4 items-center p-4 border rounded-xl">
              <div className="flex items-center gap-1">
                <Coffee />
              </div>
              <p>Boissons chaudes</p>
            </div>
            <div className="flex gap-4 items-center p-4 border rounded-xl">
              <div className="flex items-center gap-1">
                <Leaf />
              </div>
              <p>Thés variés</p>
            </div>
            <div className="flex gap-4 items-center p-4 border rounded-xl">
              <div className="flex items-center gap-1">
                <Cookie />
                <Banana />
                <CupSoda />
              </div>
              <p>Snacks & Fruits</p>
            </div>
            <div className="flex gap-4 items-center p-4 border rounded-xl">
              <div className="flex items-center gap-1">
                <UserRoundCog />
              </div>
              <p>Office/Hospitality Manager</p>
            </div>
            <div className="flex gap-4 items-center p-4 border rounded-xl">
              <div className="flex items-center gap-1">
                <HandPlatter />
              </div>
              <p>Services fm4all</p>
            </div>
          </div>
          <p>
            Pour chaque service, déplacez votre curseur pour en savoir plus et
            cliquez sur la gamme qui vous convient :{" "}
          </p>
          <div className="flex flex-wrap gap-10 justify-center text-2xl mb-10">
            <div className="w-48 text-center px-6 py-10 bg-fm4allessential rounded-lg text-slate-200 font-bold ring-4 ring-inset ring-destructive">
              Essentiel
            </div>
            <div className="w-48 text-center px-6 py-10 bg-fm4allcomfort rounded-lg text-slate-200  font-bold">
              Confort
            </div>
            <div className="w-48 text-center px-6 py-10 bg-fm4allexcellence rounded-lg text-slate-200 font-bold">
              Excellence
            </div>
          </div>
        </div>
      </div>
      <NextServiceButton handleClickNext={handleClickNext} />
    </div>
  );
};

export default MesServicesPresentation;
