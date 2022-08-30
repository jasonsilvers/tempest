import { monitorJWT } from '../../fixtures/jwt';

describe('Can view Global Tracking Items', () => {
  beforeEach(() => {
    const baseUrl = Cypress.config('baseUrl');
    cy.intercept(baseUrl + 'api/*', (req) => {
      req.headers['Authorization'] = `Bearer ${monitorJWT}`;
    });

    cy.visit(baseUrl);
    cy.url().should('include', '/Dashboard');
    cy.findByRole('navigation', { name: /global-training-catalog/ }).click();
    cy.url().should('include', '/Trackingitems');
  });

  it('should navigate to Global Training Catalog and show a list', () => {
    cy.url().should('include', '/Trackingitems');

    cy.findByText(/global - fire extinguisher/i).should('exist');
    cy.findByText(/global - supervisor safety training/i).should('exist');
    cy.findByText(/global - fire safety/i).should('exist');
    cy.findByText(/global - keyboard warrior training/i).should('exist');
    cy.findByText(/pharmacy - big bug safety/i).should('not.exist');

    cy.findByRole('button', { name: /global training catalog/i }).click();
    cy.findByRole('option', { name: /15th medical group/i }).click();
    cy.findByText(/global/i).should('not.exist');
    cy.findByText(/mdg - shoom too fast/i).should('exist');

    cy.findByRole('button', { name: /15th medical group/i }).click();
    cy.findByRole('option', { name: /pharmacy/i }).click();
    cy.findByText(/global/i).should('not.exist');
    cy.findByText(/pharmacy/i).should('not.exist');
    cy.findByText(/pharmacy - big bug safety/i).should('exist');
  });

  it('should create new training item', () => {
    cy.findByRole('button', { name: /create/i }).click();

    const newTrainingItemTitle = 'New training item title';
    const newTrainingItemDescription = 'New training item description';
    const newTrainingItemLocation = 'New training item location';

    cy.findByRole('textbox', { name: 'training-title-input' }).type(newTrainingItemTitle);
    cy.findByRole('textbox', { name: 'training-description-input' }).type(newTrainingItemDescription);
    cy.findByRole('textbox', { name: 'training-location-input' }).type(newTrainingItemLocation);
    cy.findByRole('button', { name: /recurrance-select/i }).click();

    cy.findByRole('option', { name: /monthly/i }).click();

    cy.findByRole('button', { name: /create/i }).click();

    cy.findByRole('button', { name: /global training catalog/i }).click();
    cy.findByRole('option', { name: /15th medical group/i }).click();

    cy.contains('Monthly').should('exist');
    cy.findByText(newTrainingItemDescription).should('exist');
  });

  it('should create new training item that closely matches one already added', () => {
    cy.findByRole('button', { name: /create/i }).click();

    const newTrainingItemTitle = 'New training item title 2';
    const newTrainingItemDescription = 'New training item description';
    const newTrainingItemLocation = 'New training item location';

    cy.findByRole('textbox', { name: 'training-title-input' }).type(newTrainingItemTitle);
    cy.findByRole('textbox', { name: 'training-description-input' }).type(newTrainingItemDescription);
    cy.findByRole('textbox', { name: 'training-location-input' }).type(newTrainingItemLocation);
    cy.findByRole('button', { name: /recurrance-select/i }).click();

    cy.findByRole('option', { name: /monthly/i }).click();

    cy.findByRole('button', { name: /create/i }).click();
    cy.findByRole('button', { name: /yes/i }).click();

    cy.findByRole('button', { name: /global training catalog/i }).click();
    cy.findByRole('option', { name: /15th medical group/i }).click();

    cy.contains(newTrainingItemTitle).should('exist');
  });
});

it('should not be able to archive or delete training on global catalog', () => {
  cy.loginAsMonitor();
  cy.wait(2000);
  cy.findByRole('navigation', { name: /global-training-catalog/ }).click();

  cy.findByRole('menuitem', {
    name: /delete/i,
  }).should('not.exist');

  cy.findByRole('menuitem', {
    name: /archive/i,
  }).should('not.exist');
});

it('should be able to archive training in organization catalog - Part 1', () => {
  cy.loginAsMonitor();
  cy.wait(2000);

  cy.findByRole('navigation', { name: /global-training-catalog/ }).click();
  cy.findByRole('button', { name: /global training catalog/i }).click();
  cy.findByRole('option', { name: /pharmacy/i }).click();

  cy.findByRole('menuitem', { name: /archive/i }).click();
  cy.findByRole('button', { name: /yes/i }).click();

  cy.findByRole('tab', { name: /archived/i }).click();
  cy.findByText(/pharmacy - big bug safety/i).should('exist');
});

it('should be able to archive training in organization catalog - Part 2', () => {
  cy.loginAsMemberWithRecords();

  cy.wait(2000);
  cy.findByRole('button', {name: /training in progress/i}).click()
    cy.findByRole('option', {
      name: /offical training record/i
    }).click()
  cy.findByText(/pharmacy - big bug safety/i).should('not.exist');


  cy.findByRole('navigation', { name: /archive/ }).click();
  cy.findByText(/pharmacy - big bug safety/i).should('exist');
});

it('should be able to unarchive training on organization catalog - Part 1', () => {
  cy.loginAsMonitor();
  cy.wait(2000);

  cy.findByRole('navigation', { name: /global-training-catalog/ }).click();
  cy.findByRole('button', { name: /global training catalog/i }).click();
  cy.findByRole('option', { name: /pharmacy/i }).click();

  cy.findByRole('tab', { name: /archived/i }).click();
  cy.findByRole('menuitem', { name: /unarchive/i }).click();
  cy.findByRole('button', { name: /yes/i }).click();

  cy.findByRole('tab', { name: /active items/i }).click();
  cy.findByText(/pharmacy - big bug safety/i).should('exist');
});

it('should be able to unarchive training in organization catalog - Part 2', () => {
  cy.loginAsMemberWithRecords();
  cy.wait(2000);
  cy.findByRole('button', {name: /training in progress/i}).click()
    cy.findByRole('option', {
      name: /offical training record/i
    }).click()

  cy.findByText(/pharmacy - big bug safety/i).should('exist');


  cy.findByRole('navigation', { name: /archive/ }).click();
  cy.findByText(/pharmacy - big bug safety/i).should('not.exist');
});

it('should be able to delete training on organizational catalog', () => {
  cy.loginAsMonitor();
  cy.wait(2000);

  cy.findByRole('navigation', { name: /global-training-catalog/ }).click();
  cy.findByRole('button', { name: /global training catalog/i }).click();
  cy.findByRole('option', { name: /pharmacy/i }).click();

  cy.findByRole('menuitem', { name: /delete/i }).click();
  cy.findByRole('button', { name: /yes/i }).click();

  cy.findByText(/pharmacy - paper cuts/i).should('not.exist');
});
