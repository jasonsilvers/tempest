import { monitorJWT } from '../../fixtures/jwt';

describe('Can view Global Tracking Items', () => {
  beforeEach(() => {
    const baseUrl = Cypress.config('baseUrl');
    cy.intercept(baseUrl + 'api/*', (req) => {
      req.headers['Authorization'] = `Bearer ${monitorJWT}`;
    });

    cy.visit(baseUrl);
    cy.url().should('include', '/Dashboard') 
    cy.findByRole('navigation', { name: /global-training-catalog/ }).click();
    cy.url().should('include', '/Trackingitems') 
  });

  it('should navigate to Global Training Catalog and show a list', () => {
    cy.url().should('include', '/Trackingitems');

    cy.findByText(/fire extinguisher/i).should('exist');
    cy.findByText(/supervisor safety training/i).should('exist');
    cy.findByText(/fire safety/i).should('exist');
    cy.findByText(/big bug safety/i).should('exist');
    cy.findByText(/keyboard warrior training/i).should('exist');
  });

  it('should create new training item', () => {
    cy.findByRole('button', { name: /create/i }).click();

    const newTrainingItemTitle = 'New training item title';
    const newTrainingItemDescription = 'New training item description';
    const newTrainingItemLocation = 'New training item location'

    cy.findByRole('textbox', { name: 'training-title-input' }).type(newTrainingItemTitle);
    cy.findByRole('textbox', { name: 'training-description-input' }).type(newTrainingItemDescription);
    cy.findByRole('textbox', { name: 'training-location-input' }).type(newTrainingItemLocation);
    cy.findByRole('button', {name: /recurrance-select/i,}).click();

    cy.findByRole('option', {name: /monthly/i}).click()

    cy.findByRole('button', { name: /create/i }).click();

    cy.findByRole('button', {name: /global training catalog/i}).click()
    cy.findByRole('option', {name: /15th medical group/i}).click()
   
    cy.contains('Monthly').should('exist');
    cy.findByText(newTrainingItemDescription).should('exist');
  });
});
