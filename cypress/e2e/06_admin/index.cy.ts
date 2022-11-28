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

    cy.findAllByText(/lrs/i).should('be.visible');
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
    cy.findAllByRole('tab', { name: /users/i }).first().click();

    
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

  it.only('should be able to move tracking item to different org or to global', () => {
    cy.findByRole('navigation', { name: /super/i }).should('be.visible');
    //wait for dashboard to load
    //then route to admin page
    cy.url().should('include', '/Dashboard') 
    cy.url().should('include', '/Dashboard');
    cy.findByRole('navigation', { name: /global-training-catalog/ }).click();

    cy.findByRole('button', { name: /create/i }).click();

    const newTrainingItemTitle = 'Ti move';
    const newTrainingItemDescription = 'New training item to test admin org change';
    const newTrainingItemLocation = 'New training item location';

    cy.findByRole('textbox', { name: 'training-title-input' }).type(newTrainingItemTitle);
    cy.findByRole('textbox', { name: 'training-description-input' }).type(newTrainingItemDescription);
    cy.findByRole('textbox', { name: 'training-location-input' }).type(newTrainingItemLocation);
    cy.findByRole('button', { name: /recurrance-select/i }).click();

    cy.findByRole('option', { name: /monthly/i }).click();

    cy.findByRole('button', { name: /create/i }).click();

    cy.contains(newTrainingItemTitle)

    cy.findByRole('button', { name: /global training catalog/i }).click();
    cy.findByRole('option', { name: /pharmacy/i }).click();

    cy.contains(newTrainingItemTitle).should('not.exist')

    cy.findByRole('navigation', { name: 'super-admin' }).click();

    cy.findByRole('listitem', {
      name: /11\-ti\-div/i
    }).within(() => {
      cy.findByRole('button', {name: /none/i}).click()
    });

    cy.findByRole('option', { name: /pharmacy/i }).click()

    cy.findByRole('alert').should('be.visible');

    cy.findByRole('navigation', { name: /global-training-catalog/ }).click();

    cy.contains(newTrainingItemTitle).should('not.exist')

    cy.findByRole('button', { name: /global training catalog/i }).click();
    cy.findByRole('option', { name: /pharmacy/i }).click();

    cy.contains(newTrainingItemTitle).should('exist')

    
  });

});
