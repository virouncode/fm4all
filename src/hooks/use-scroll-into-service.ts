import { useServicesStore } from "@/stores/devis/servicesStore";
import { useEffect } from "react";
import { useMediaQuery } from "react-responsive";

export default function useScrollIntoService() {
  const services = useServicesStore((s) => s.services);
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });
  useEffect(() => {
    if (isTabletOrMobile) return;
    const currentService = document.getElementById(
      services.currentServiceId.toString(),
    );
    if (currentService) {
      currentService.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [services.currentServiceId, isTabletOrMobile]);
}
