import { programManagerJWT } from '../../fixtures/jwt';

describe('Can use admin features', () => {
  beforeEach(() => {
    const baseUrl = Cypress.config('baseUrl');

    cy.intercept(baseUrl + 'api/**', (req) => {
      req.headers['Authorization'] = `Bearer ${programManagerJWT}`;
    });

    cy.visit(baseUrl);
  });

  it('should navigate to admin page', () => {
    //wait for dashboard to load
    //then route to admin page
    cy.url().should('include', '/Dashboard') 
    cy.findByRole('navigation', { name: /super/i }).should('not.exist');
    cy.findByRole('navigation', { name: /admin/i }).should('be.visible');
    cy.findByRole('navigation', { name: /admin/i }).click();

  });

  it('should view list of users and be able to change their organization', () => {
    cy.url().should('include', '/Dashboard') 

    cy.findByRole('navigation', { name: /admin/i }).click();
    cy.findByRole('tab', { name: /users/i }).click();

    //should only show 12 members
    cy.findByText(/1–12 of 12/i).should('exist')

    cy.findAllByText(/platform one/i).eq(4).click()

    cy.findByText(/member selected/i).should('be.visible')

  });

});