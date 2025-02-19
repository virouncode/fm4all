import { ManagementContext } from "@/context/ManagementProvider";
import { useContext, useEffect } from "react";

export default function useScrollIntoManagement() {
  const { management } = useContext(ManagementContext);
  useEffect(() => {
    const currentManagement = document.getElementById(
      management.currentManagementId.toString()
    );
    if (currentManagement) {
      currentManagement.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [management.currentManagementId]);
}
