"use client";
import { ServicesContext } from "@/context/ServicesProvider";
import {
  FireExtinguisher,
  HandPlatter,
  SprayCan,
  User,
  Wrench,
} from "lucide-react";
import { useContext } from "react";
import NextServiceButton from "./NextServiceButton";

const servicesChoices = [
  {
    id: 1,
    description: "Nettoyage et propreté",
    icon: <SprayCan />,
  },
  { id: 2, description: "Consommables propreté", icon: <SprayCan /> },
  {
    id: 3,
    description: "Maintenance",
    icon: <Wrench />,
  },
  {
    id: 4,
    description: "Sécurité incendie",
    icon: <FireExtinguisher />,
  },
  {
    id: 5,
    description: "Office Manager",
    icon: <User />,
  },
  {
    id: 6,
    description: "Services fm4all",
    icon: <HandPlatter />,
  },
];

type ServicesSelectionProps = {
  handleClickNext: () => void;
};

const ServicesSelection = ({ handleClickNext }: ServicesSelectionProps) => {
  const { services, setServices } = useContext(ServicesContext);
  const isServiceSelected = (serviceId: number) =>
    services.selectedServicesIds.includes(serviceId);

  const handleClickService = (serviceId: number) => {
    if (isServiceSelected(serviceId)) {
      if (serviceId === 1) {
        setServices((prev) => ({
          ...prev,
          selectedServicesIds: prev.selectedServicesIds
            .filter(
              (selectedServiceId) =>
                selectedServiceId !== 1 && selectedServiceId !== 2
            )
            .sort((a, b) => a - b),
        }));
        return;
      }
      setServices((prev) => ({
        ...prev,
        selectedServicesIds: prev.selectedServicesIds
          .filter((selectedServiceId) => selectedServiceId !== serviceId)
          .sort((a, b) => a - b),
      }));
    } else {
      if (serviceId === 1) {
        setServices((prev) => ({
          ...prev,
          selectedServicesIds: [...prev.selectedServicesIds, 1, 2].sort(
            (a, b) => a - b
          ),
        }));
        return;
      }
      setServices((prev) => ({
        ...prev,
        selectedServicesIds: [...prev.selectedServicesIds, serviceId].sort(
          (a, b) => a - b
        ),
      }));
    }
  };
  return (
    <div
      className="flex flex-col gap-10 w-full mx-auto h-[600px] py-2"
      id="services-selection"
    >
      <p className="text-base md:text-lg">
        Sélectionnez les services dont vous avez besoin :
      </p>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6">
        {servicesChoices
          .filter(({ id }) => id !== 2)
          .map((service) => (
            <div
              className={`flex gap-4 items-center p-4 border-2 rounded-xl cursor-pointer ${
                isServiceSelected(service.id)
                  ? "bg-fm4allsecondary/10 border-fm4allsecondary text-fm4allsecondary "
                  : "hover:text-fm4allsecondary hover:border-fm4allsecondary"
              }`}
              key={service.id}
              onClick={() => handleClickService(service.id)}
            >
              {service.icon}
              <p>{service.description}</p>
            </div>
          ))}
      </div>
      {services.selectedServicesIds.length > 0 && (
        <NextServiceButton handleClickNext={handleClickNext} />
      )}
    </div>
  );
};

export default ServicesSelection;
