import { ServicesContext } from "@/context/ServicesProvider";
import { useContext, useEffect } from "react";
import { useMediaQuery } from "react-responsive";

export default function useScrollIntoService() {
  const { services } = useContext(ServicesContext);
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });
  useEffect(() => {
    if (isTabletOrMobile) return;
    console.log(services.currentServiceId.toString());

    const currentService = document.getElementById(
      services.currentServiceId.toString()
    );
    console.log("currentService", currentService);
    if (currentService) {
      currentService.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [services.currentServiceId, isTabletOrMobile]);
}
