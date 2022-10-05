import { adminJWT } from '../../fixtures/jwt';

describe('Can use admin features', () => {
  beforeEach(() => {
    const baseUrl = Cypress.config('baseUrl');

    cy.intercept(baseUrl + 'api/**', (req) => {
      req.headers['Authorization'] = `Bearer ${adminJWT}`;
    });

    cy.visit(baseUrl);
  });

  it('should navigate to admin page', () => {
    cy.findByRole('navigation', { name: /super/i }).should('be.visible');
    //wait for dashboard to load
    //then route to admin page
    cy.url().should('include', '/Dashboard') 
    cy.findByRole('navigation', { name: /super/i }).click();

    cy.findAllByText(/frank monitor/i).should('be.visible');
  });

  it('should be able to view logs', () => {
    cy.url().should('include', '/Dashboard') 

    cy.findByRole('navigation', { name: /super/i }).should('be.visible');
    //wait for dashboard to load

    cy.findByRole('navigation', { name: /super/i }).click();
    cy.findByRole('tab', { name: /log data/i }).click();

    
  });

});
