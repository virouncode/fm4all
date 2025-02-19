import { ManagementContext } from "@/context/ManagementProvider";
import { useContext, useEffect } from "react";

export default function useScrollIntoManagement() {
  const { management } = useContext(ManagementContext);
  useEffect(() => {
    const currentManagement = document.getElementById(
      management.currentManagementId.toString()
    );
    if (currentManagement) {
      setTimeout(() => {
        currentManagement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 100);
    }
  }, [management.currentManagementId]);
}
