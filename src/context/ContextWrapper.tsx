import React from "react";
import CafeProvider from "./CafeProvider";
import ClientProvider from "./ClientProvider";
import CommentairesProvider from "./CommentairesProvider";
import DevisProgressProvider from "./DevisProgressProvider";
import FontainesProvider from "./FontainesProvider";
import FoodBeverageProvider from "./FoodBeverageProvider";
import HygieneProvider from "./HygieneProvider";
import IncendieProvider from "./IncendieProvider";
import MaintenanceProvider from "./MaintenanceProvider";
import ManagementProvider from "./ManagementProvider";
import MonDevisProvider from "./MonDevisProvider";
import NettoyageProvider from "./NettoyageProvider";
import OfficeManagerProvider from "./OfficeManagerProvider";
import PersonnalisationProvider from "./PersonnalisationProvider";
import ServicesFm4AllProvider from "./ServicesFm4AllProvider";
import ServicesProvider from "./ServicesProvider";
import SnacksFruitsProvider from "./SnacksFruitsProvider";
import TheProvider from "./TheProvider";
import TotalCafeProvider from "./TotalCafeProvider";
import TotalFontainesProvider from "./TotalFontainesProvider";
import TotalHygieneProvider from "./TotalHygieneProvider";
import TotalIncendieProvider from "./TotalIncendieProvider";
import TotalMaintenanceProvider from "./TotalMaintenanceProvider";
import TotalNettoyageProvider from "./TotalNettoyageProvider";
import TotalOfficeManagerProvider from "./TotalOfficeManagerProvider";
import TotalProvider from "./TotalProvider";
import TotalServicesFm4AllProvider from "./TotalServicesFm4AllProvider";
import TotalSnacksFruitsProvider from "./TotalSnacksFruitsProvider";
import TotalTheProvider from "./TotalTheProvider";

type ContextWrapperProps = {
  children: React.ReactNode;
};

const ContextWrapper = ({ children }: ContextWrapperProps) => {
  return (
    <DevisProgressProvider>
      <ClientProvider>
        <ServicesProvider>
          <PersonnalisationProvider>
            <MonDevisProvider>
              <NettoyageProvider>
                <HygieneProvider>
                  <IncendieProvider>
                    <MaintenanceProvider>
                      <FoodBeverageProvider>
                        <CafeProvider>
                          <TheProvider>
                            <SnacksFruitsProvider>
                              <FontainesProvider>
                                <ManagementProvider>
                                  <OfficeManagerProvider>
                                    <ServicesFm4AllProvider>
                                      <CommentairesProvider>
                                        <TotalProvider>
                                          <TotalNettoyageProvider>
                                            <TotalHygieneProvider>
                                              <TotalIncendieProvider>
                                                <TotalMaintenanceProvider>
                                                  <TotalCafeProvider>
                                                    <TotalTheProvider>
                                                      <TotalSnacksFruitsProvider>
                                                        <TotalFontainesProvider>
                                                          <TotalOfficeManagerProvider>
                                                            <TotalServicesFm4AllProvider>
                                                              {children}
                                                            </TotalServicesFm4AllProvider>
                                                          </TotalOfficeManagerProvider>
                                                        </TotalFontainesProvider>
                                                      </TotalSnacksFruitsProvider>
                                                    </TotalTheProvider>
                                                  </TotalCafeProvider>
                                                </TotalMaintenanceProvider>
                                              </TotalIncendieProvider>
                                            </TotalHygieneProvider>
                                          </TotalNettoyageProvider>
                                        </TotalProvider>
                                      </CommentairesProvider>
                                    </ServicesFm4AllProvider>
                                  </OfficeManagerProvider>
                                </ManagementProvider>
                              </FontainesProvider>
                            </SnacksFruitsProvider>
                          </TheProvider>
                        </CafeProvider>
                      </FoodBeverageProvider>
                    </MaintenanceProvider>
                  </IncendieProvider>
                </HygieneProvider>
              </NettoyageProvider>
            </MonDevisProvider>
          </PersonnalisationProvider>
        </ServicesProvider>
      </ClientProvider>
    </DevisProgressProvider>
  );
};

export default ContextWrapper;
