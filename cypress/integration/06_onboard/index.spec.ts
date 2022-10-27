import { memberJWT, member2JWTNoOrg } from '../../fixtures/jwt';

describe('Member With No Org', () => {
  it('member with no org visits welcome screen an create new org', () => {
    const baseUrl = Cypress.config('baseUrl');

    cy.intercept(baseUrl + 'api/**', (req) => {
      req.headers['Authorization'] = `Bearer ${member2JWTNoOrg}`;
    });

    cy.visit(baseUrl);

    cy.wait(2000);
    cy.url().should('include', '/Welcome');

    cy.findByText(/start here/i).click();
    const orgName = 'New Org';
    const orgShortName = 'Org';
    cy.findByLabelText(/organization name/i).type(orgName);
    cy.findByLabelText(/short name/i).type(orgShortName);
    cy.findByRole('button', { name: /create/i }).click();
    cy.url().should('include', '/Programadmin');
  });
});

describe('Member That Has An Org', () => {
  it('member goes to the onboard url to create new org', () => {
    const baseUrl = Cypress.config('baseUrl');
    cy.intercept(baseUrl + 'api/**', (req) => {
      req.headers['Authorization'] = `Bearer ${memberJWT}`;
    });

    cy.visit(baseUrl);

    cy.wait(2000);
    cy.url().should('include', '/Profile');

    cy.visit(baseUrl + '/Onboard');
    const orgName = 'New Org';
    const orgShortName = 'Org';
    cy.findByLabelText(/organization name/i).type(orgName);
    cy.findByLabelText(/short name/i).type(orgShortName);
    cy.findByRole('button', { name: /create/i }).click();
    cy.url().should('include', '/Programadmin');
  });
});
