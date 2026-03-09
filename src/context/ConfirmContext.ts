import { createContext } from "react";

export type ConfirmOptions = {
  title?: string;
  description?: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  /**
   * Par défaut danger=false → bouton primaire "standard"
   * Si danger=true → tu peux utiliser un variant="destructive"
   */
  danger?: boolean;
};

type ConfirmContextValueType = (opts: ConfirmOptions) => Promise<boolean>;

export const ConfirmContext = createContext<ConfirmContextValueType | null>(null);
