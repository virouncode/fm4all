import { render, screen } from "@testing-library/react";
import { createContext, ReactNode } from "react";
import {
  mocki18nNavigation,
  mockNextIntl,
  mockUIButton,
  pushMock,
} from "../mocks";

mockUIButton();
mocki18nNavigation();
mockNextIntl();

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogTrigger: ({ children }: { children: ReactNode }) => children,
  DialogContent: ({ children }: { children: ReactNode }) => children,
  DialogDescription: ({ children }: { children: ReactNode }) => children,
  DialogHeader: ({ children }: { children: ReactNode }) => children,
  DialogTitle: ({ children }: { children: ReactNode }) => <h1>{children}</h1>,
  DialogFooter: ({ children }: { children: ReactNode }) => children,
  DialogClose: ({ children }: { children: ReactNode }) => children,
}));

vi.mock("@/context/DevisProgressProvider", () => {
  const DevisProgressContext = createContext({
    devisProgress: {
      currentStep: 2,
      completedSteps: [1],
    },
    setDevisProgress: vi.fn(),
  });

  return {
    DevisProgressProvider: ({ children }: { children: ReactNode }) => (
      <DevisProgressContext.Provider
        value={{
          devisProgress: {
            currentStep: 2,
            completedSteps: [1],
          },
          setDevisProgress: vi.fn(),
        }}
      >
        {children}
      </DevisProgressContext.Provider>
    ),
    DevisProgressContext,
  };
});

const renderWithDevisProgress = (
  ui: ReactNode,
  value: {
    devisProgress: {
      currentStep: number;
      completedSteps: number[];
    };
    setDevisProgress: (value: unknown) => void;
  }
) =>
  render(
    <DevisProgressContext.Provider value={value}>
      {ui}
    </DevisProgressContext.Provider>
  );

vi.mock("@/context/ClientProvider", () => {
  const ClientContext = createContext({
    client: {
      nomEntreprise: "",
      siret: null,
      prenomContact: "",
      nomContact: "",
      posteContact: "",
      emailContact: "",
      prenomSignataire: null,
      nomSignataire: null,
      posteSignataire: null,
      emailSignataire: null,
      phoneContact: "",
      surface: 100,
      effectif: 20,
      typeBatiment: "bureaux",
      typeOccupation: "partieEtage",
      adresseLigne1: null,
      adresseLigne2: null,
      codePostal: "",
      ville: "",
      dateDeDemarrage: null,
      commentaires: null,
    },
    setClient: vi.fn(),
  });
  return {
    ClientContextProvider: ({ children }: { children: ReactNode }) => (
      <ClientContext.Provider
        value={{
          client: {
            nomEntreprise: "",
            siret: null,
            prenomContact: "",
            nomContact: "",
            posteContact: "",
            emailContact: "",
            prenomSignataire: null,
            nomSignataire: null,
            posteSignataire: null,
            emailSignataire: null,
            phoneContact: "",
            surface: 100,
            effectif: 20,
            typeBatiment: "bureaux",
            typeOccupation: "partieEtage",
            adresseLigne1: null,
            adresseLigne2: null,
            codePostal: "",
            ville: "",
            dateDeDemarrage: null,
            commentaires: null,
          },
          setClient: vi.fn(),
        }}
      >
        {children}
      </ClientContext.Provider>
    ),
    ClientContext,
  };
});

const renderWithProgressAndClient = (
  ui: ReactNode,
  valueProgress: {
    devisProgress: {
      currentStep: number;
      completedSteps: number[];
    };
    setDevisProgress: (value: unknown) => void;
  },
  valueClient: {
    client: InsertClientType;
    setClient: () => void;
  }
) =>
  render(
    <DevisProgressContext.Provider value={valueProgress}>
      <ClientContext.Provider value={valueClient}>{ui}</ClientContext.Provider>
    </DevisProgressContext.Provider>
  );

const setIsMobileNavOpen = vi.fn();

import DevisButton from "@/components/buttons/devis-button";
import { ClientContext } from "@/context/ClientProvider";
import { DevisProgressContext } from "@/context/DevisProgressProvider";
import { InsertClientType } from "@/zod-schemas/client";

describe("DevisButton", () => {
  it("should render a button with the correct text", () => {
    render(
      <DevisButton title="Mon devis en ligne" text="Mon devis en ligne" />
    );
    expect(screen.getByText("Mon devis en ligne")).toBeInTheDocument();
  });

  it("should push to /devis/locaux if no devis in progress", () => {
    renderWithDevisProgress(
      <DevisButton title="Mon devis en ligne" text="Mon devis en ligne" />,
      {
        devisProgress: {
          currentStep: 0,
          completedSteps: [],
        },
        setDevisProgress: vi.fn(),
      }
    );

    const button = screen.getByRole("button", { name: "Mon devis en ligne" });
    button.click();
    expect(pushMock).toHaveBeenCalledWith("/devis/locaux");
  });

  it("should open a dialog when a devis is in progress", () => {
    renderWithDevisProgress(
      <DevisButton title="Mon devis en ligne" text="Mon devis en ligne" />,
      {
        devisProgress: {
          currentStep: 2,
          completedSteps: [1],
        },
        setDevisProgress: vi.fn(),
      }
    );
    const button = screen.getByRole("button", {
      name: "Mon devis en ligne",
    });
    button.click();
    expect(screen.getByText("devis-en-cours")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "reprendre" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "nouveau" })).toBeInTheDocument();
  });

  it("should handle 'Nouveau' and 'Reprendre' actions correctly", () => {
    renderWithDevisProgress(
      <DevisButton
        title="Mon devis en ligne"
        text="Mon devis en ligne"
        setIsMobileNavOpen={setIsMobileNavOpen}
      />,
      {
        devisProgress: {
          currentStep: 2,
          completedSteps: [1],
        },
        setDevisProgress: vi.fn(),
      }
    );

    const button = screen.getByRole("button", { name: "Mon devis en ligne" });
    button.click();

    const reprendreButton = screen.getByRole("button", { name: "reprendre" });
    reprendreButton.click();
    expect(pushMock).toHaveBeenCalled();
    expect(setIsMobileNavOpen).toHaveBeenCalledWith(false);

    const nouveauButton = screen.getByRole("button", { name: "nouveau" });
    nouveauButton.click();
    expect(pushMock).toHaveBeenCalledWith("/devis/locaux");
    expect(setIsMobileNavOpen).toHaveBeenCalledWith(false);
  });

  it("should redirect to /devis/services with the right search params", () => {
    renderWithProgressAndClient(
      <DevisButton
        title="Mon devis en ligne"
        text="Mon devis en ligne"
        setIsMobileNavOpen={setIsMobileNavOpen}
      />,
      {
        devisProgress: {
          currentStep: 2,
          completedSteps: [1],
        },
        setDevisProgress: vi.fn(),
      },
      {
        client: {
          nomEntreprise: "Test Company",
          siret: "123456789",
          prenomContact: "John",
          nomContact: "Doe",
          posteContact: "Manager",
          emailContact: "john.doe@gmail.com",
          prenomSignataire: null,
          nomSignataire: null,
          posteSignataire: null,
          emailSignataire: null,
          phoneContact: "",
          surface: 100,
          effectif: 20,
          typeBatiment: "bureaux",
          typeOccupation: "partieEtage",
          adresseLigne1: null,
          adresseLigne2: null,
          codePostal: "",
          ville: "",
          dateDeDemarrage: null,
          commentaires: null,
        },
        setClient: vi.fn(),
      }
    );

    const button = screen.getByRole("button", { name: "Mon devis en ligne" });
    button.click();
    const reprendreButton = screen.getByRole("button", { name: "reprendre" });
    reprendreButton.click();
    expect(pushMock).toHaveBeenLastCalledWith({
      pathname: "/devis/services",
      query: {
        effectif: "20",
        surface: "100",
      },
    });
  });
  it("should redirect to /devis/sauvegarder with the right search params", () => {
    const { getByText, getByRole } = renderWithProgressAndClient(
      <DevisButton
        title="Mon devis en ligne"
        text="Mon devis en ligne"
        setIsMobileNavOpen={setIsMobileNavOpen}
      />,
      {
        devisProgress: {
          currentStep: 5,
          completedSteps: [1, 2, 3, 4],
        },
        setDevisProgress: vi.fn(),
      },
      {
        client: {
          nomEntreprise: "Test Company",
          siret: "123456789",
          prenomContact: "John",
          nomContact: "Doe",
          posteContact: "Manager",
          emailContact: "john.doe@gmail.com",
          prenomSignataire: null,
          nomSignataire: null,
          posteSignataire: null,
          emailSignataire: null,
          phoneContact: "",
          surface: 100,
          effectif: 20,
          typeBatiment: "bureaux",
          typeOccupation: "partieEtage",
          adresseLigne1: null,
          adresseLigne2: null,
          codePostal: "",
          ville: "",
          dateDeDemarrage: null,
          commentaires: null,
        },
        setClient: vi.fn(),
      }
    );

    const button = getByRole("button", { name: "Mon devis en ligne" });
    button.click();
    const reprendreButton = getByRole("button", { name: "reprendre" });
    reprendreButton.click();
    expect(pushMock).toHaveBeenLastCalledWith({
      pathname: "/devis/sauvegarder",
      query: {
        effectif: "20",
        surface: "100",
        typeBatiment: "bureaux",
        typeOccupation: "partieEtage",
      },
    });
  });
});
