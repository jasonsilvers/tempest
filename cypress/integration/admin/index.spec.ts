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
    cy.findByText(/overdue/i);
    //then route to admin page
    cy.findByRole('navigation', { name: /admin/i }).click();

    cy.findByText(/sandra clark/i).should('be.visible');
    cy.findByText(/joe smith/i).should('be.visible');

    cy.findByRole('button', { name: /dental/i }).click();
    cy.findByRole('option', { name: /15th mdg/i }).click();
    cy.findByRole('alert').should('be.visible');
    cy.findByText(/sandra clark/i)
      .parent()
      .within(() => {
        cy.findByText(/15th mdg/i).should('be.visible');
      });

    cy.findByRole('button', { name: /member/i }).click();
    cy.findByRole('option', { name: /monitor/i }).click();
    cy.findByRole('alert').should('be.visible');
    cy.findByText(/sandra clark/i)
      .parent()
      .within(() => {
        cy.findByText(/monitor/i).should('be.visible');
      });
  });

  it('should be able to view logs', () => {
    cy.findByRole('navigation', { name: /admin/i }).should('be.visible');
    //wait for dashboard to load
    cy.findByText(/overdue/i);
    //then route to admin page
    cy.findByRole('navigation', { name: /admin/i }).click();
    cy.findByRole('tab', { name: /log data/i }).click();

    cy.findByText(/authorized/i).should('be.visible');
  });
});
