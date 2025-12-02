import { mocki18nNavigation, pushMock } from "@/__tests__/mocks/next-i18n";
import { mockNextIntl } from "@/__tests__/mocks/next-intl";
import { fullReinitialisationDevis } from "@/app/[locale]/(main)/(application)/devis/(etapes)/locaux/fullReinitialisationDevis";
import { DevisProgressContext } from "@/context/DevisProgressProvider";
import { DevisProgressType } from "@/zod-schemas/devisProgress";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dispatch, ReactNode, SetStateAction } from "react";
import { describe, expect, it } from "vitest";

mocki18nNavigation();
mockNextIntl();

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: { children: ReactNode }) => children,
  DialogTrigger: ({ children }: { children: ReactNode }) => children,
  DialogContent: ({ children }: { children: ReactNode }) => children,
  DialogDescription: ({ children }: { children: ReactNode }) => children,
  DialogHeader: ({ children }: { children: ReactNode }) => children,
  DialogTitle: ({ children }: { children: ReactNode }) => <h1>{children}</h1>,
  DialogFooter: ({ children }: { children: ReactNode }) => children,
  DialogClose: ({ children }: { children: ReactNode }) => children,
}));

vi.mock(
  "@/app/[locale]/(main)/(application)/devis/(etapes)/locaux/fullReinitialisationDevis",
  () => ({
    fullReinitialisationDevis: vi.fn(),
  }),
);

const renderWithContexts = (
  children: ReactNode,
  options?: {
    devisContext?: {
      devisProgress: DevisProgressType;
      setDevisProgress: Dispatch<SetStateAction<DevisProgressType>>;
    };
    prospectContext?: {
      prospect: InsertProspectType;
      setProspect: Dispatch<SetStateAction<InsertProspectType>>;
    };
  },
) => {
  const { devisContext, prospectContext } = options ?? {};

  render(
    <DevisProgressContext.Provider
      value={
        devisContext ?? {
          devisProgress: { currentStep: 0, completedSteps: [] },
          setDevisProgress: vi.fn(),
        }
      }
    >
      {prospectContext ? (
        <ProspectContext.Provider value={prospectContext}>
          {children}
        </ProspectContext.Provider>
      ) : (
        children
      )}
    </DevisProgressContext.Provider>,
  );

  return {
    button: screen.getByRole("button", { name: "Mon devis en ligne" }),
  };
};

const setIsMobileNavOpen = vi.fn();
const defaultProspect: InsertProspectType = {
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
};

import DevisButton from "@/components/buttons/devis-button";
import { InsertProspectType } from "@/zod-schemas/prospect";

describe("DevisButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("should render a button with the correct text", () => {
    render(
      <DevisButton title="Mon devis en ligne" text="Mon devis en ligne" />,
    );
    screen.getByRole("button", { name: "Mon devis en ligne" });
  });

  it("should push to /devis/locaux if no devis in progress", async () => {
    const { button } = renderWithContexts(
      <DevisButton title="Mon devis en ligne" text="Mon devis en ligne" />,
      {
        devisContext: {
          devisProgress: {
            currentStep: 0,
            completedSteps: [],
          },
          setDevisProgress: vi.fn(),
        },
      },
    );
    const user = userEvent.setup();
    await user.click(button);
    expect(pushMock).toHaveBeenCalledWith("/devis/locaux");
  });

  it("should open a dialog when a devis is in progress", async () => {
    const { button } = renderWithContexts(
      <DevisButton title="Mon devis en ligne" text="Mon devis en ligne" />,
      {
        devisContext: {
          devisProgress: {
            currentStep: 2,
            completedSteps: [1],
          },
          setDevisProgress: vi.fn(),
        },
      },
    );
    const user = userEvent.setup();
    await user.click(button);
    expect(
      screen.getByRole("heading", { name: "devis-en-cours" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "reprendre" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "nouveau" })).toBeInTheDocument();
  });

  it("should handle 'Nouveau' action correctly", async () => {
    const { button } = renderWithContexts(
      <DevisButton
        title="Mon devis en ligne"
        text="Mon devis en ligne"
        setIsMobileNavOpen={setIsMobileNavOpen}
      />,
      {
        devisContext: {
          devisProgress: {
            currentStep: 2,
            completedSteps: [1],
          },
          setDevisProgress: vi.fn(),
        },
      },
    );

    const user = userEvent.setup();
    await user.click(button);

    const nouveauButton = screen.getByRole("button", { name: "nouveau" });
    await user.click(nouveauButton);
    expect(pushMock).toHaveBeenCalledWith("/devis/locaux");
    expect(setIsMobileNavOpen).toHaveBeenCalledWith(false);
    expect(fullReinitialisationDevis).toHaveBeenCalled();
  });

  it("should handle 'Reprendre' action correctly", async () => {
    const { button } = renderWithContexts(
      <DevisButton
        title="Mon devis en ligne"
        text="Mon devis en ligne"
        setIsMobileNavOpen={setIsMobileNavOpen}
      />,
      {
        devisContext: {
          devisProgress: {
            currentStep: 2,
            completedSteps: [1],
          },
          setDevisProgress: vi.fn(),
        },
      },
    );

    const user = userEvent.setup();
    await user.click(button);

    const reprendreButton = screen.getByRole("button", { name: "reprendre" });
    await user.click(reprendreButton);
    expect(pushMock).toHaveBeenCalled();
    expect(setIsMobileNavOpen).toHaveBeenCalledWith(false);
  });

  it("should redirect to /devis/services with the right search params", async () => {
    const { button } = renderWithContexts(
      <DevisButton
        title="Mon devis en ligne"
        text="Mon devis en ligne"
        setIsMobileNavOpen={setIsMobileNavOpen}
      />,
      {
        devisContext: {
          devisProgress: {
            currentStep: 2,
            completedSteps: [1],
          },
          setDevisProgress: vi.fn(),
        },
        prospectContext: {
          prospect: defaultProspect,
          setProspect: vi.fn(),
        },
      },
    );

    const user = userEvent.setup();
    await user.click(button);
    const reprendreButton = screen.getByRole("button", { name: "reprendre" });
    await user.click(reprendreButton);
    expect(pushMock).toHaveBeenCalledWith({
      pathname: "/devis/services",
      query: {
        effectif: "20",
        surface: "100",
      },
    });
  });
  it("should redirect to /devis/sauvegarder with the right search params", async () => {
    const { button } = renderWithContexts(
      <DevisButton
        title="Mon devis en ligne"
        text="Mon devis en ligne"
        setIsMobileNavOpen={setIsMobileNavOpen}
      />,
      {
        devisContext: {
          devisProgress: {
            currentStep: 5,
            completedSteps: [1, 2, 3, 4],
          },
          setDevisProgress: vi.fn(),
        },
        prospectContext: {
          prospect: defaultProspect,
          setProspect: vi.fn(),
        },
      },
    );

    const user = userEvent.setup();
    await user.click(button);
    const reprendreButton = screen.getByRole("button", { name: "reprendre" });
    await user.click(reprendreButton);
    expect(pushMock).toHaveBeenCalledWith({
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
