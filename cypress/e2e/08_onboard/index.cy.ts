import { memberJWT, member2JWTNoOrg } from '../../fixtures/jwt';


describe('Member That Has An Org', () => {
  it('member goes to the onboard url to create new org', () => {
    const baseUrl = Cypress.config('baseUrl');
    cy.intercept(baseUrl + '*/api/**', (req) => {
      req.headers['Authorization'] = `Bearer ${memberJWT}`;
    });

    cy.visit(baseUrl + '/Tempest');

    cy.wait(2000);
  
    cy.visit(baseUrl + '/Tempest/Onboard');

    const orgName = 'New Org';
    const orgShortName = 'Org';
    cy.findByLabelText(/organization name/i).type(orgName);
    cy.findByLabelText(/short name/i).type(orgShortName);
    cy.findByRole('button', { name: /create/i }).click();
    cy.url().should('include', '/Programadmin');
  });
});
