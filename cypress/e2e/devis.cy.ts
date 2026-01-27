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
  label = "",
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
    cy.url().should("include", "/mes-services", { timeout: 50000 });

    // ➤ Étape 3 : Nettoyage
    cy.get("[data-testid='next-service-button']").eq(0).click();
    cy.get("[data-testid='nettoyage-proposition-switch']").eq(2).click();
    verifyMontantService(
      "[data-testid='total-mensuel-nettoyage']",
      "[data-testid='total-service']",
      2,
      "Nettoyage",
    );
    cy.get('[data-testid="sheet-overlay"]').as("sheetOverlay").click();

    // ➤ Étape 4 : Repasse sanitaire
    cy.get("[data-testid='next-service-button']").eq(1).click();
    cy.get("[data-testid='repasse-switch']").click();
    verifyMontantService(
      "[data-testid='total-mensuel-repasse']",
      "[data-testid='total-repasse']",
      0,
      "Repasse",
    );
    cy.get("@sheetOverlay").click();

    // ➤ Étape 5 : Samedi
    cy.get("[data-testid='samedi-switch']").click();
    verifyMontantService(
      "[data-testid='total-mensuel-samedi']",
      "[data-testid='total-samedi']",
      0,
      "Samedi",
    );
    cy.get("@sheetOverlay").click();

    // ➤ Étape 6 : Dimanche
    cy.get("[data-testid='dimanche-switch']").click();
    verifyMontantService(
      "[data-testid='total-mensuel-dimanche']",
      "[data-testid='total-dimanche']",
      0,
      "Dimanche",
    );
    cy.get("@sheetOverlay").click();

    // ➤ Étape 7 : Vitrerie
    cy.get("[data-testid='vitrerie-switch']").click();
    verifyMontantService(
      "[data-testid='total-mensuel-vitrerie']",
      "[data-testid='total-vitrerie']",
      0,
      "Vitrerie",
    );
    cy.get("@sheetOverlay").click();

    // ➤ Étape 8 : Hygiene sanitaire
    cy.get("[data-testid='next-service-button']").eq(2).click();
    cy.get("[data-testid='hygiene-switch']")
      .eq(0)
      .should("have.attr", "data-state", "checked");
    verifyMontantService(
      "[data-testid='total-mensuel-trilogie']",
      "[data-testid='total-trilogie']",
      0,
      "Hygiene",
    );
    cy.get("@sheetOverlay").click();

    // ➤ Étape 9 : Options d'hygiène
    cy.get("[data-testid='next-service-button']").eq(3).click();
    cy.get("[data-testid='desinfectant-switch']").eq(0).click();
    verifyMontantService(
      "[data-testid='total-mensuel-desinfectant']",
      "[data-testid='total-desinfectant']",
      0,
      "Desinfectant",
    );
    cy.get("@sheetOverlay").click();
    cy.get("[data-testid='parfum-switch']").eq(0).click();
    verifyMontantService(
      "[data-testid='total-mensuel-parfum']",
      "[data-testid='total-parfum']",
      0,
      "Parfum",
    );
    cy.get("@sheetOverlay").click();
    cy.get("[data-testid='balai-switch']").eq(0).click();
    verifyMontantService(
      "[data-testid='total-mensuel-balai']",
      "[data-testid='total-balai']",
      0,
      "Balai",
    );
    cy.get("@sheetOverlay").click();
    cy.get("[data-testid='poubelle-switch']").eq(0).click();
    verifyMontantService(
      "[data-testid='total-mensuel-poubelle']",
      "[data-testid='total-poubelle']",
      0,
      "Poubelle",
    );
    cy.get("@sheetOverlay").click();

    // ➤ Étape 10 : Maintenance
    cy.get("[data-testid='next-service-button']").eq(4).click();
    cy.get("[data-testid='maintenance-switch']").eq(0).click();
    verifyMontantService(
      "[data-testid='total-mensuel-maintenance']",
      "[data-testid='total-maintenance']",
      0,
      "Maintenance",
    );
    cy.get("@sheetOverlay").click();

    // ➤ Étape 11 : Sécurité incendie
    cy.get("[data-testid='next-service-button']").eq(5).click();
    cy.get("[data-testid='incendie-switch']").eq(0).click();
    verifyMontantService(
      "[data-testid='total-mensuel-incendie']",
      "[data-testid='total-incendie']",
      0,
      "Incendie",
    );
    cy.get("@sheetOverlay").click();
    cy.get("[data-testid='next-service-button']").as("nextServiceButton");
    cy.log("@nextServiceButton", "@nextServiceButton");
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
      "Cafe Espace 1",
    );
    cy.get("@sheetOverlay").click();
    cy.get("[data-testid='add-espace-button']").eq(0).click();
    cy.get("[data-testid='cafe-switch-2']").eq(0).click();
    verifyMontantService(
      "[data-testid='total-mensuel-cafe-2']",
      "[data-testid='total-cafe-2']",
      0,
      "Cafe Espace 2",
    );
    cy.get("@sheetOverlay").click();
    cy.get("[data-testid='next-service-button']").eq(0).click();

    // ➤ Étape 13 : Thé
    cy.get("[data-testid='the-switch']").eq(1).click();
    verifyMontantService(
      "[data-testid='total-mensuel-the']",
      "[data-testid='total-the']",
      1,
      "The",
    );
    cy.get("@sheetOverlay").click();
    cy.get("[data-testid='next-service-button']").eq(1).click();

    // ➤ Étape 14 : Snacks & fruits
    cy.get("[data-testid='snacksfruits-switch']").eq(2).click();
    cy.get("[data-testid='snacks-checkbox']").eq(0).click();
    cy.get("[data-testid='boissons-checkbox']").eq(0).click();
    verifyMontantService(
      "[data-testid='total-mensuel-snacksfruits']",
      "[data-testid='total-snacksfruits']",
      2,
      "Snacks & fruits",
    );
    cy.get("@sheetOverlay").click();
    cy.get("[data-testid='next-service-button']").eq(2).click();

    // ➤ Étape 15 : Fontaine à eau
    cy.get("[data-testid='fontaine-switch-1']").eq(0).click();
    cy.get("[data-testid='eau-gazeuse-checkbox']").eq(0).click();
    cy.get("[data-testid='eau-chaude-checkbox']").eq(0).click();
    verifyMontantService(
      "[data-testid='total-mensuel-fontaine-1']",
      "[data-testid='total-fontaine-1']",
      0,
      "Fontaine à eau espace 1",
    );
    cy.get("@sheetOverlay").click();
    cy.get("[data-testid='add-espace-button']").eq(1).click();
    cy.get("[data-testid='fontaine-switch-2']").eq(0).click();
    verifyMontantService(
      "[data-testid='total-mensuel-fontaine-2']",
      "[data-testid='total-fontaine-2']",
      0,
      "Fontaine à eau espace 2",
    );
    cy.get("@sheetOverlay").click();
    cy.get("[data-testid='next-service-button']").eq(3).click();
    cy.url().should("include", "/pilotage-prestations");

    // ➤ Étape 16 : Office manager
    cy.get("[data-testid='office-manager-switch']").eq(0).click();
    verifyMontantService(
      "[data-testid='total-mensuel-office-manager']",
      "[data-testid='total-office-manager']",
      0,
      "Office manager",
    );
    cy.get("@sheetOverlay").click();
    cy.get("[data-testid='next-service-button']").eq(0).click();

    // ➤ Étape 17 : Services FM4All
    cy.get("[data-testid='services-fm4all-switch-essentiel']")
      .eq(0)
      .should("have.attr", "data-state", "checked");
    verifyMontantService(
      "[data-testid='total-mensuel-services-fm4all-essentiel']",
      "[data-testid='total-services-fm4all']",
      0,
      "Services fm4all",
    );
    cy.get("@sheetOverlay").click();
    cy.get("[data-testid='next-service-button']").eq(1).click();
    cy.url().should("include", "/sauvegarder-ma-progression");

    // ➤ Étape 18 : Sauvegarder la progression
    cy.get("[data-testid='sauvegarder-progression-button']").should(
      "be.disabled",
    );
    cy.get("[data-testid='sauvegarder-acceptation-checkbox']").should(
      "not.be.checked",
    );
    cy.get("[data-testid='sauvegarder-acceptation-checkbox']").click();
    cy.get("[data-testid='sauvegarder-progression-button']").should(
      "not.be.disabled",
    );
    cy.get("[data-testid='email-contact-input']").type("virounk@gmail.com");
    cy.get("[data-testid='phone-contact-input']").type("0683267962");
    cy.get("[data-testid='nom-entreprise-input']").type("Viroun Kattygnarath");
    cy.get("[data-testid='prenom-contact-input']").type("Viroun");
    cy.get("[data-testid='nom-contact-input']").type("Kattygnarath");
    cy.get("[data-testid='poste-contact-input']").type("CTO");
    cy.get("[data-testid='sauvegarder-progression-button']").click();
    cy.url().should("include", "/personnaliser-mon-devis");

    // ➤ Étape 19 : Personnaliser le devis
    cy.get("[data-testid='next-service-button']").eq(0).click();
    cy.get("[data-testid='next-service-button']").eq(1).click();
    cy.get("[data-testid='next-service-button']").eq(2).click();
    cy.get("[data-testid='next-service-button']").eq(3).click();
    cy.get("[data-testid='valider-personnalisation']").click();
    cy.url().should("include", "/afficher-mon-devis");

    // ➤ Étape 20 : Afficher le devis
    cy.get("[data-testid='acceptation-checkbox']").should("not.be.checked");
    cy.get("[data-testid='afficher-devis-button']").should("be.disabled");
    cy.get("[data-testid='acceptation-checkbox']").click();
    cy.get("[data-testid='afficher-devis-button']").should("not.be.disabled");
    cy.get("[data-testid='afficher-devis-button']").click();
    cy.get("#2", { timeout: 50000 }).should("exist");
  });
});
