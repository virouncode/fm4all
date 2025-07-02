// Nettoyage des chaînes de caractères de prix
const cleanNumberString = (text: string) =>
  text
    .replace(/\u202f/g, "") // espace insécable
    .replace(/\s/g, "") // autres espaces
    .replace("€/mois", "")
    .replace("€HT/an", "")
    .replace("€ HT/an", "")
    .replace(",", ".")
    .trim();

// Vérifie qu’un montant annuel ≈ mensualité * 12 (tolérance ±1)
function verifyMontantService(
  mensualSelector: string,
  annuelSelector: string,
  index = 0,
  label = ""
) {
  cy.log(`Vérification du service : **${label || mensualSelector}**`);
  cy.get(mensualSelector)
    .eq(index)
    .invoke("text")
    .then((mensuelText) => {
      const totalMensuel = parseFloat(cleanNumberString(mensuelText));
      const totalAnnuelCalcule = Math.round(totalMensuel * 12);

      cy.get("[data-testid='total-button']").click();

      cy.get(annuelSelector)
        .invoke("text")
        .then((annuelText) => {
          const totalAnnuel = parseFloat(cleanNumberString(annuelText));
          expect(Math.abs(totalAnnuel - totalAnnuelCalcule)).to.be.lte(1);
        });
    });
}

describe("Parcours devis", { viewportHeight: 850, viewportWidth: 1400 }, () => {
  beforeEach(() => {
    cy.visit("/");
    cy.get("[data-testid='cookie-accept-button']").click();
  });

  it("devrait suivre et valider le parcours du devis", () => {
    // ➤ Étape 1 : Test de zone non couverte
    cy.log("Étape 1 : Zone non couverte");
    cy.get("header [data-testid='devis-button']").click();
    cy.get("[data-testid='code-postal-input']").type("64000");
    cy.get("[data-testid='afficher-tarifs-button']").click();
    cy.url().should("include", "/zone-non-couverte");

    // ➤ Étape 2 : Accès aux services
    cy.log("Étape 2 : Accès aux services");
    cy.get("header [data-testid='devis-button']").click();
    cy.get("[data-testid='code-postal-input']").type("75001");
    cy.get("[data-testid='afficher-tarifs-button']").click();
    cy.url().should("include", "/mes-services");

    // ➤ Étape 3 : Nettoyage

    cy.get("[data-testid='next-service-button']").eq(0).click();
    cy.get("[data-testid='nettoyage-proposition-switch']").eq(2).click();
    verifyMontantService(
      "[data-testid='total-mensuel-nettoyage']",
      "[data-testid='total-service']",
      2,
      "Nettoyage"
    );
    cy.get('[data-testid="sheet-overlay"]').click();

    // ➤ Étape 4 : Repasse sanitaire
    cy.get("[data-testid='next-service-button']").eq(1).click();
    cy.get("[data-testid='repasse-switch']").click();
    verifyMontantService(
      "[data-testid='total-mensuel-repasse']",
      "[data-testid='total-repasse']",
      0,
      "Repasse"
    );
    cy.get('[data-testid="sheet-overlay"]').click();

    // ➤ Étape 5 : Samedi
    cy.get("[data-testid='samedi-switch']").click();
    verifyMontantService(
      "[data-testid='total-mensuel-samedi']",
      "[data-testid='total-samedi']",
      0,
      "Samedi"
    );
    cy.get('[data-testid="sheet-overlay"]').click();

    // ➤ Étape 6 : Dimanche
    cy.get("[data-testid='dimanche-switch']").click();
    verifyMontantService(
      "[data-testid='total-mensuel-dimanche']",
      "[data-testid='total-dimanche']",
      0,
      "Dimanche"
    );
    cy.get('[data-testid="sheet-overlay"]').click();

    // ➤ Étape 7 : Vitrerie
    cy.get("[data-testid='vitrerie-switch']").click();
    verifyMontantService(
      "[data-testid='total-mensuel-vitrerie']",
      "[data-testid='total-vitrerie']",
      0,
      "Vitrerie"
    );
    cy.get('[data-testid="sheet-overlay"]').click();

    // ➤ Étape 8 : Hygiene sanitaire
    cy.get("[data-testid='next-service-button']").eq(2).click();
    cy.get("[data-testid='hygiene-switch']")
      .eq(0)
      .should("have.attr", "data-state", "checked");
    verifyMontantService(
      "[data-testid='total-mensuel-trilogie']",
      "[data-testid='total-trilogie']",
      0,
      "Hygiene"
    );
    cy.get('[data-testid="sheet-overlay"]').click();

    // ➤ Étape 9 : Options d'hygiène
    cy.get("[data-testid='next-service-button']").eq(3).click();
    cy.get("[data-testid='desinfectant-switch']").eq(0).click();
    verifyMontantService(
      "[data-testid='total-mensuel-desinfectant']",
      "[data-testid='total-desinfectant']",
      0,
      "Desinfectant"
    );
    cy.get('[data-testid="sheet-overlay"]').click();
    cy.get("[data-testid='parfum-switch']").eq(0).click();
    verifyMontantService(
      "[data-testid='total-mensuel-parfum']",
      "[data-testid='total-parfum']",
      0,
      "Parfum"
    );
    cy.get('[data-testid="sheet-overlay"]').click();
    cy.get("[data-testid='balai-switch']").eq(0).click();
    verifyMontantService(
      "[data-testid='total-mensuel-balai']",
      "[data-testid='total-balai']",
      0,
      "Balai"
    );
    cy.get('[data-testid="sheet-overlay"]').click();
    cy.get("[data-testid='poubelle-switch']").eq(0).click();
    verifyMontantService(
      "[data-testid='total-mensuel-poubelle']",
      "[data-testid='total-poubelle']",
      0,
      "Poubelle"
    );
    cy.get('[data-testid="sheet-overlay"]').click();

    // ➤ Étape 10 : Maintenance
    cy.get("[data-testid='next-service-button']").eq(4).click();
    cy.get("[data-testid='maintenance-switch']").eq(0).click();
    verifyMontantService(
      "[data-testid='total-mensuel-maintenance']",
      "[data-testid='total-maintenance']",
      0,
      "Maintenance"
    );
    cy.get('[data-testid="sheet-overlay"]').click();

    // ➤ Étape 11 : Sécurité incendie
    cy.get("[data-testid='next-service-button']").eq(5).click();
    cy.get("[data-testid='incendie-switch']").eq(0).click();
    verifyMontantService(
      "[data-testid='total-mensuel-incendie']",
      "[data-testid='total-incendie']",
      0,
      "Incendie"
    );
    cy.get('[data-testid="sheet-overlay"]').click();
    cy.get("[data-testid='next-service-button']").eq(6).click();
    cy.url().should("include", "/food-and-beverage");

    // ➤ Étape 12 : Cafe
    cy.get("[data-testid='type-boisson-chocolat']").eq(0).click();
    cy.get("[data-testid='duree-location-trigger-1']").eq(0).click();
    cy.get("[data-testid='duree-location-pa48M-1']").eq(0).click();
    cy.get("[data-testid='cafe-switch-1']").eq(0).click();
    verifyMontantService(
      "[data-testid='total-mensuel-cafe-1']",
      "[data-testid='total-cafe-1']",
      0,
      "Cafe Espace 1"
    );
    cy.get('[data-testid="sheet-overlay"]').click();
    cy.get("[data-testid='add-espace-button']").eq(0).click();
    cy.get("[data-testid='cafe-switch-2']").eq(0).click();
    verifyMontantService(
      "[data-testid='total-mensuel-cafe-2']",
      "[data-testid='total-cafe-2']",
      0,
      "Cafe Espace 2"
    );
    cy.get('[data-testid="sheet-overlay"]').click();
  });
});
