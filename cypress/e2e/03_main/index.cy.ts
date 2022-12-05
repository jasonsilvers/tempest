import { member2JWTNoOrg, memberJWT, monitorJWT } from '../../fixtures/jwt';

describe('Monitor Role', () => {
  it('Visits the site, should show dashboard and Global Training Catalog', () => {
    const baseUrl = Cypress.config('baseUrl');

    cy.intercept(baseUrl + '*/api/*', (req) => {
      req.headers['Authorization'] = `Bearer ${monitorJWT}`;
    });

    cy.visit(baseUrl + '/Tempest');

    cy.url().should('include', '/Dashboard');

    cy.findByRole('navigation', { name: /dashboard/ }).should('be.visible');
    cy.findByRole('navigation', { name: /global-training-catalog/ }).should('be.visible');
    cy.contains(/admin/).should('not.exist');
    cy.contains(/super admin/).should('not.exist');
  });
});

describe('Member Role', () => {
  it('Visits the site, should not show dashboard and Global Training Catalog', () => {
    const baseUrl = Cypress.config('baseUrl');

    cy.intercept(baseUrl + '*/api/**', (req) => {
      req.headers['Authorization'] = `Bearer ${memberJWT}`;
    });

    cy.visit(baseUrl + '/Tempest');

    cy.wait(2000);
    cy.url().should('include', '/Profile');

    cy.contains(/dashboard/i).should('not.exist');
    cy.contains(/global-training-catalog/).should('not.exist');
    cy.contains(/admin/).should('not.exist');
    cy.contains(/super admin/).should('not.exist');
  });

  it('vists the site and redirect to welcome page, if user has no organization', () => {
    const baseUrl = Cypress.config('baseUrl');

    cy.intercept(baseUrl + '*/api/**', (req) => {
      req.headers['Authorization'] = `Bearer ${member2JWTNoOrg}`;
    });

    cy.visit(baseUrl + '/Tempest');

    cy.wait(2000);
    cy.url().should('include', '/Welcome');

    cy.get('.MuiAutocomplete-popupIndicator').click();
    cy.findByRole('option', { name: /dental/i }).click();

    cy.findByRole('button', { name: /get started/i }).click();

    cy.url().should('include', '/Tempest/Profile');
  });
});
