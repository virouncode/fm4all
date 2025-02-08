"use client";

import { useClientOnly } from "@/hooks/use-client-only";
import { ManagementType } from "@/zod-schemas/management";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useState,
} from "react";

// Initialization of context
export const ManagementContext = createContext<{
  management: ManagementType;
  setManagement: Dispatch<SetStateAction<ManagementType>>;
}>({
  management: { currentManagementId: 1 },
  setManagement: () => {},
});

const ManagementProvider = ({ children }: PropsWithChildren) => {
  const isMounted = useClientOnly();

  // Default state initialization
  const [management, setManagement] = useState<ManagementType>({
    currentManagementId: 1,
  });

  // Load data from localStorage after mounting
  useEffect(() => {
    if (isMounted) {
      const storedManagement = localStorage.getItem("management");
      if (storedManagement) {
        setManagement(JSON.parse(storedManagement));
      }
    }
  }, [isMounted]);

  // Save data to localStorage when state changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("management", JSON.stringify(management));
    }
  }, [management, isMounted]);

  // Conditional rendering to ensure client-only hooks work
  if (!isMounted) return null;

  return (
    <ManagementContext.Provider value={{ management, setManagement }}>
      {children}
    </ManagementContext.Provider>
  );
};

export default ManagementProvider;
