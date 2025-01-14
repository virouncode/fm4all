import { CafeContext } from "@/context/CafeProvider";
import { useContext, useEffect } from "react";

export default function useScrollIntoMachine() {
  const { cafe } = useContext(CafeContext);
  useEffect(() => {
    if (cafe.currentMachineId === null) return;
    const currentMachine = document.getElementById(
      `machine_${cafe.currentMachineId.toString()}`
    );
    if (currentMachine) {
      currentMachine.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [cafe.currentMachineId]);
}
