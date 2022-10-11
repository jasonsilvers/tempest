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

  it('should be able able to delete user', () => {
    cy.url().should('include', '/Dashboard') 

    cy.findByRole('navigation', { name: 'admin' }).should('be.visible');
    //wait for dashboard to load

    cy.findByRole('navigation', { name: 'admin' }).click();
    cy.findByRole('tab', { name: /users/i }).click();

    //should only show 12 members
    cy.findByText(/1–15 of 15/i).should('exist')

    cy.findAllByText(/15th medical group/i).eq(4).click()

    cy.findByText(/member selected/i).should('be.visible')

    cy.findByRole('button', {
      name: /delete/i
    }).should('exist').click()

    cy.findByText(/warning/i)

    cy.findByRole('button', {name: /no/i}).click()

    cy.findByRole('button', {
      name: /delete/i
    }).click()

    cy.findByText(/warning/i)

    cy.findByRole('button', {name: /yes/i}).click()

    cy.findByText(/1–14 of 14/i).should('exist')

  });

});
