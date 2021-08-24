import { memberJWT, monitorJWT } from '../../fixtures/jwt';

describe('Member role', () => {
  beforeEach(() => {
    const baseUrl = Cypress.config('baseUrl');
    cy.intercept(baseUrl + 'api/**', (req) => {
      req.headers['Authorization'] = `Bearer ${memberJWT}`;
    });

    cy.visit(baseUrl);
    cy.findByRole('navigation', { name: /my-profile/i }).click();
  });

  it('should show No items', () => {
    cy.findAllByText(/no items/i).should('have.length', 2);
  });

  it('should add new training', () => {
    cy.findByRole('button', { name: /add new/i }).click();

    cy.intercept('/api/trackingitems').as('getTrackingItems');
    cy.wait('@getTrackingItems');

    cy.findByRole('textbox').type('fire extinguisher');
    cy.findByText(/fire extinguisher/i).click();

    cy.get('#date').type('2021-10-01');
    cy.findByRole('button', { name: /add/i }).click();

    cy.findByText(/fire extinguisher/i).should('exist');

    cy.findByRole('button', { name: /awaiting signature/i }).should('be.disabled');
    cy.findByRole('button', { name: 'signature_button' }).should('be.enabled');
    cy.findByRole('button', { name: 'signature_button' }).click();

    cy.cleanUpRecords();
    cy.findByText(/fire extinguisher/i).should('not.exist');
  });
});

// describe('Monitor role', () => {
//   beforeEach(() => {
//     const baseUrl = Cypress.config('baseUrl');
//     cy.intercept(baseUrl + 'api/**', (req) => {
//       req.headers['Authorization'] = `Bearer ${memberJWT}`;
//     });

//     cy.visit(baseUrl);
//     cy.findByRole('navigation', { name: /my-profile/i }).click();
//   });

//   it('should show current completed tracking items', () => {
//     cy.findByText(/no items/i).should('exist');
//   });
// });
