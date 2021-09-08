import { monitorJWT } from '../../fixtures/jwt';

describe('Can view Global Tracking Items', () => {
  beforeEach(() => {
    const baseUrl = Cypress.config('baseUrl');
    cy.intercept(baseUrl + 'api/*', (req) => {
      req.headers['Authorization'] = `Bearer ${monitorJWT}`;
    });

    cy.visit(baseUrl);
  });

  it('should show list of users', () => {
    cy.findByText(/sandra clark/i, { timeout: 10000 }).should('exist');
    cy.findByText(/joe smith/i, { timeout: 10000 }).should('exist');
  });
});
