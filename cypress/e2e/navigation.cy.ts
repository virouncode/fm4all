describe("navigation", { viewportHeight: 800, viewportWidth: 1400 }, () => {
  beforeEach(() => {
    cy.visit("/");
    cy.get("[data-testid='cookie-accept-button']").click();
  });

  it("navigates correctly in French", () => {
    cy.get("[data-testid='gammes-link']").click();
    cy.url().should("include", "/nos-3-gammes");
    cy.contains(/nos 3 gammes/i).should("be.visible");

    cy.get("[data-testid='engagements-link']").click();
    cy.url().should("include", "/nos-engagements");
    cy.contains(/nos engagements/i).should("be.visible");

    cy.get("[data-testid='partenaires-link']").click();
    cy.url().should("include", "/nos-partenaires");
    cy.contains(/nos partenaires/i).should("be.visible");

    cy.get("[data-testid='services-trigger']").realHover();
    cy.contains(/tous nos services/i).should("be.visible");

    cy.get("[data-testid='secteurs-trigger']").realHover();
    cy.contains(/tous nos secteurs/i).should("be.visible");

    cy.get("[data-testid='contact-link-button']").click();
    cy.url().should("include", "/contactez-nous");
    cy.contains(/nous contacter/i).should("be.visible");

    cy.get("[data-testid='home-link']").click();
    cy.url().should("eq", "http://localhost:3000/fr");
  });

  it("switches to English and navigates correctly", () => {
    cy.get("[data-testid='locale-button']").click();
    cy.get("[data-testid='locale-en']").click();
    cy.url().should("eq", "http://localhost:3000/en");

    cy.get("[data-testid='gammes-link']").click();
    cy.url().should("include", "/our-3-tiers");
    cy.contains(/our 3 tiers/i).should("be.visible");

    cy.get("[data-testid='engagements-link']").click();
    cy.url().should("include", "/our-commitments");
    cy.contains(/our commitments/i).should("be.visible");

    cy.get("[data-testid='partenaires-link']").click();
    cy.url().should("include", "/our-partners");
    cy.contains(/our partners/i).should("be.visible");

    cy.get("[data-testid='services-trigger']").realHover();
    cy.contains(/all our services/i).should("be.visible");

    cy.get("[data-testid='secteurs-trigger']").realHover();
    cy.contains(/all our sectors/i).should("be.visible");

    cy.get("[data-testid='contact-link-button']").click();
    cy.url().should("include", "/contact-us");
    cy.contains(/contact us/i).should("be.visible");

    cy.get("[data-testid='home-link']").click();
    cy.url().should("eq", "http://localhost:3000/en");
  });

  it("can switch back to French", () => {
    cy.get("[data-testid='locale-button']").click();
    cy.get("[data-testid='locale-fr']").click();
    cy.url().should("eq", "http://localhost:3000/fr");
  });
});
