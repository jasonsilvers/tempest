import { programManagerJWT } from '../../fixtures/jwt';

describe('Can use program admin features', () => {
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

  it('should view list of organizations, add, delete and update', () => {
    cy.url().should('include', '/Dashboard') 

    cy.findByRole('navigation', { name: /admin/i }).click();
    cy.findByRole('tab', { name: /organizations/i }).click();

    //should only show 12 members
    cy.findByText((/1–1 of 1/i)).should('exist')
    cy.findByText(/platform one/i).should('exist')

    cy.findByTestId('AddIcon').click()

    cy.findByRole('textbox', {
      name: /name\-input/i
    }).type('test name')
    
    cy.findByRole('textbox', {
      name: /shortname/i
    }).type('test short name')

    cy.findByRole('button', {
      name: /platform one/i
    }).click()

    cy.findAllByRole('option').should('have.length', 1)

    cy.findAllByRole('option').click()

    cy.findByRole('button', {
      name: /create/i
    }).click()

    cy.findByRole('alert').should('exist')

    cy.findByText(/test name/i).should('exist')

    cy.findByText(/test name/i).click()

    cy.findByText(/organization selected/i).should('exist')

    cy.findByRole('button', {
      name: /update/i
    }).should('be.disabled')

    cy.findByRole('textbox', {
      name: /org\-name/i
    }).clear().type('changed test name')

    cy.findByRole('textbox', {
      name: /org\-shortname/i
    }).clear().type('changed short name')

    cy.findByRole('button', {
      name: /parent\-select/i
    }).click()

    cy.findAllByRole('option').should('have.length', 1)

    cy.findAllByRole('option').click()

    cy.findByRole('button', {
      name: /no/i
    }).click()

    cy.findByRole('option', {
      name: /yes/i
    }).click()


    cy.findByRole('button', {
      name: /update/i
    }).click()

    cy.findByText(/changed test name/i).should('exist')
    cy.findByText(/changed short name/i).should('exist')
    cy.findAllByText(/catalog/i).should('have.length', 3)

    cy.findByText(/platform one/i).click()

    cy.findByRole('button', {name: /delete/i}).should('be.disabled')

    cy.findByRole('button', {name: /cancel/i}).click()

    cy.findByText(/organization selected/i).should('not.exist')

    cy.findByText(/changed test name/i).click()

    cy.findByRole('button', {name: /delete/i}).should('be.enabled').click()

    cy.findByText(/chagned test name/i).should('not.exist')


    cy.findByTestId('AddIcon').click()

    cy.findByRole('textbox', {
      name: /name\-input/i
    }).type('dev team')
    
    cy.findByRole('textbox', {
      name: /shortname/i
    }).type('development team')

    cy.findByRole('button', {
      name: /platform one/i
    }).click()

    cy.findAllByRole('option').should('have.length', 1)

    cy.findAllByRole('option').click()

    cy.findByRole('button', {
      name: /create/i
    }).click()


  });

  it('should view list of users and be able to change their organization', () => {
    cy.url().should('include', '/Dashboard') 

    cy.findByRole('navigation', { name: /admin/i }).click();
    cy.findAllByRole('tab', { name: /users/i }).first().click();
    
    //should only show 12 members
    cy.findByText(/1–12 of 12/i).should('exist')

    cy.findAllByText(/platform one/i).eq(4).click()

    cy.findByText(/member selected/i).should('be.visible')

    cy.findByRole('button', {
      name: /update/i
    }).should('be.disabled')

    cy.findByRole('button', {
      name: /select\-org/i
    }).click()

    cy.findByRole('option', {
      name: /development team/i
    }).click()

    cy.findByRole('button', {
      name: /select\-report\-org/i
    }).click()

    cy.findByRole('option', {
      name: /development team/i
    }).click()

    cy.findByRole('button', {
      name: /select\-roles/i
    }).click()

    cy.findByRole('option', {
      name: /monitor/i
    }).click()

    cy.findByRole('button', {
      name: /update/i
    }).click()
  });

  it('should detach member', () => {
    cy.url().should('include', '/Dashboard') 

    cy.findByRole('navigation', { name: /admin/i }).click();
    cy.findAllByRole('tab', { name: /users/i }).first().click();
    
    //should only show 12 members
    cy.findByText(/1–12 of 12/i).should('exist')

    cy.findAllByText(/platform one/i).eq(4).click()

    cy.findByText(/member selected/i).should('be.visible')

    cy.findByRole('button', {
      name: /delete/i
    }).should('not.exist')

    cy.findByRole('button', {
      name: /detach member/i
    }).click()

    cy.findByText(/warning/i)

    cy.findByRole('button', {name: /no/i}).click()

    cy.findByRole('button', {
      name: /detach member/i
    }).click()

    cy.findByText(/warning/i)

    cy.findByRole('button', {name: /yes/i}).click()

    cy.findByText(/1–11 of 11/i).should('exist')

  });

});