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
    cy.findByRole('navigation', { name: /admin/i }).should('be.visible');
    //wait for dashboard to load
    //then route to admin page
    cy.url().should('include', '/Dashboard') 
    cy.findByRole('navigation', { name: /admin/i }).click();

    cy.findByText(/scarlet member/i).should('be.visible');
    cy.findByText(/sam member/i).should('be.visible');

    cy.findByRole('button', { name: /15th mdg exc staff/i }).click();
    cy.findByRole('option', { name: /public health/i }).click();
    cy.findByRole('alert').should('be.visible');
 
    cy.findByRole('button', { name: /monitor/i }).click();
    cy.findByRole('option', { name: /member/i }).click();

    cy.findByRole('alert').should('be.visible');
  });

  it('should be able to view logs', () => {
    cy.url().should('include', '/Dashboard') 

    cy.findByRole('navigation', { name: /admin/i }).should('be.visible');
    //wait for dashboard to load

    cy.findByRole('navigation', { name: /admin/i }).click();
    cy.findByRole('tab', { name: /log data/i }).click();

    cy.findByText(/page_access/i).should('be.visible');
  });
});
