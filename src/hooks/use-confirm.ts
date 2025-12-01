import { ConfirmContext } from "@/context/ConfirmContext";
import { useContext } from "react";

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within <ConfirmProvider>");
  return ctx;
}
