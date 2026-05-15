"use client";

import { CafeStoreProvider } from "@/stores/devis/cafeStore";
import { CommentairesStoreProvider } from "@/stores/devis/commentairesStore";
import { DevisProgressStoreProvider } from "@/stores/devis/devisProgressStore";
import { FontainesStoreProvider } from "@/stores/devis/fontainesStore";
import { FoodBeverageStoreProvider } from "@/stores/devis/foodBeverageStore";
import { HygieneStoreProvider } from "@/stores/devis/hygieneStore";
import { IncendieStoreProvider } from "@/stores/devis/incendieStore";
import { MaintenanceStoreProvider } from "@/stores/devis/maintenanceStore";
import { ManagementStoreProvider } from "@/stores/devis/managementStore";
import { MonDevisStoreProvider } from "@/stores/devis/monDevisStore";
import { NettoyageStoreProvider } from "@/stores/devis/nettoyageStore";
import { OfficeManagerStoreProvider } from "@/stores/devis/officeManagerStore";
import { PersonnalisationStoreProvider } from "@/stores/devis/personnalisationStore";
import { ProspectStoreProvider } from "@/stores/devis/prospectStore";
import { ServicesFm4AllStoreProvider } from "@/stores/devis/servicesFm4AllStore";
import { ServicesStoreProvider } from "@/stores/devis/servicesStore";
import { SnacksFruitsStoreProvider } from "@/stores/devis/snacksFruitsStore";
import { TheStoreProvider } from "@/stores/devis/theStore";
import { TotalServicesFm4AllStoreProvider } from "@/stores/devis/totalServicesFm4AllStore";
import { TotalStoreProvider } from "@/stores/devis/totalStore";
import type { ReactNode } from "react";

/**
 * Compose tous les Providers Zustand du parcours devis.
 * Chaque requête (chaque arbre React monté) reçoit ses propres instances
 * de stores via useRef → pas de fuite SSR entre utilisateurs.
 *
 * Voir CLAUDE.md — "RÈGLE ABSOLUE — Zustand & SSR".
 */
export function DevisStoresProvider({ children }: { children: ReactNode }) {
  return (
    <ProspectStoreProvider>
      <DevisProgressStoreProvider>
        <NettoyageStoreProvider>
          <HygieneStoreProvider>
            <MaintenanceStoreProvider>
              <IncendieStoreProvider>
                <CafeStoreProvider>
                  <TheStoreProvider>
                    <SnacksFruitsStoreProvider>
                      <FontainesStoreProvider>
                        <OfficeManagerStoreProvider>
                          <ServicesFm4AllStoreProvider>
                            <CommentairesStoreProvider>
                              <ServicesStoreProvider>
                                <FoodBeverageStoreProvider>
                                  <ManagementStoreProvider>
                                    <PersonnalisationStoreProvider>
                                      <MonDevisStoreProvider>
                                        <TotalServicesFm4AllStoreProvider>
                                          <TotalStoreProvider>
                                            {children}
                                          </TotalStoreProvider>
                                        </TotalServicesFm4AllStoreProvider>
                                      </MonDevisStoreProvider>
                                    </PersonnalisationStoreProvider>
                                  </ManagementStoreProvider>
                                </FoodBeverageStoreProvider>
                              </ServicesStoreProvider>
                            </CommentairesStoreProvider>
                          </ServicesFm4AllStoreProvider>
                        </OfficeManagerStoreProvider>
                      </FontainesStoreProvider>
                    </SnacksFruitsStoreProvider>
                  </TheStoreProvider>
                </CafeStoreProvider>
              </IncendieStoreProvider>
            </MaintenanceStoreProvider>
          </HygieneStoreProvider>
        </NettoyageStoreProvider>
      </DevisProgressStoreProvider>
    </ProspectStoreProvider>
  );
}
