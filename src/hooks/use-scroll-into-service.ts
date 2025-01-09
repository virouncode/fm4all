import { ServicesContext } from "@/context/ServicesProvider";
import { useContext, useEffect } from "react";

export default function useScrollIntoService() {
  const { services } = useContext(ServicesContext);
  useEffect(() => {
    const currentService = document.getElementById(
      services.currentServiceId.toString()
    );
    if (currentService) {
      currentService.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [services.currentServiceId]);
}
