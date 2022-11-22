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
    cy.url().should('include', '/Dashboard');
    cy.findByRole('navigation', { name: /super/i }).click();

    cy.findAllByText(/lrs/i).should('be.visible');
  });

  it('should be able to view logs', () => {
    cy.url().should('include', '/Dashboard');

    cy.findByRole('navigation', { name: /super/i }).should('be.visible');
    //wait for dashboard to load

    cy.findByRole('navigation', { name: /super/i }).click();
    cy.findByRole('tab', { name: /log data/i }).click();
  });

  it('should be able to move tracking item to different org or to global', () => {
    cy.findByRole('navigation', { name: /super/i }).should('be.visible');
    //wait for dashboard to load
    //then route to admin page
    cy.url().should('include', '/Dashboard');
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

    cy.contains(newTrainingItemTitle);

    cy.findByRole('button', { name: /global training catalog/i }).click();
    cy.findByRole('option', { name: /pharmacy/i }).click();

    cy.contains(newTrainingItemTitle).should('not.exist');

    cy.findByRole('navigation', { name: 'super-admin' }).click();

    cy.findByRole('listitem', {
      name: /11\-ti\-div/i,
    }).within(() => {
      cy.findByRole('button', { name: /none/i }).click();
    });

    cy.findByRole('option', { name: /pharmacy/i }).click();

    cy.findByRole('alert').should('be.visible');

    cy.findByRole('navigation', { name: /global-training-catalog/ }).click();

    cy.contains(newTrainingItemTitle).should('not.exist');

    cy.findByRole('button', { name: /global training catalog/i }).click();
    cy.findByRole('option', { name: /pharmacy/i }).click();

    cy.contains(newTrainingItemTitle).should('exist');
  });

  it('should be able to merge user accounts', () => {
    cy.url().should('include', '/Dashboard');

    cy.findByRole('navigation', { name: /super/i }).should('be.visible');
    //wait for dashboard to load

    cy.findByRole('navigation', { name: /super/i }).click();
    cy.findByRole('tab', { name: /users/i }).click();

    const emailToChange = 'austin.powers@gmail.com';
    const newEmail = 'austin.powers2@gmail.com';

    cy.findByRole('button', { name: /merge/i }).click();
    cy.get('form').within(($form) => {

    cy.get('input#winnerAccount').type(`${emailToChange}{downArrow}{enter}`, {delay: 100})
    cy.get('input#loserAccount').type(`${newEmail}{downArrow}{enter}`, {delay: 100})
  })

    cy.findByRole('button', { name: /merge accounts/i }).should('exist');
    cy.findByRole('button', { name: /merge accounts/i }).click();
  });
});
