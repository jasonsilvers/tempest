import { monitorJWT } from '../../fixtures/jwt';

describe('Can view Global Tracking Items', () => {
  beforeEach(() => {
    const baseUrl = Cypress.config('baseUrl');
    cy.intercept(baseUrl + 'api/*', (req) => {
      req.headers['Authorization'] = `Bearer ${monitorJWT}`;
    });

    cy.visit(baseUrl);
  });

  it('should show list of users in organization', () => {

    cy.findByRole('button', {
      name: /rows per page: 5/i
    }).click()
    cy.findByRole('option', {
      name: /25/i
    }).click()
    cy.findByText(/member, sam/i, { timeout: 10000 }).should('exist');
    cy.findByText(/member, scarlet/i, { timeout: 10000 }).should('exist');
    cy.findByText(/monitor, frank/i, { timeout: 10000 }).should('exist');
  });
});
