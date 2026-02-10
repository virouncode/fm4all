import { useManagementStore } from "@/stores/devis/managementStore";
import { useEffect } from "react";
import { useMediaQuery } from "react-responsive";

export default function useScrollIntoManagement() {
  const management = useManagementStore((s) => s.management);
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });

  useEffect(() => {
    if (isTabletOrMobile) return;
    const currentManagement = document.getElementById(
      management.currentManagementId.toString(),
    );
    if (currentManagement) {
      currentManagement.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [management.currentManagementId, isTabletOrMobile]);
}
