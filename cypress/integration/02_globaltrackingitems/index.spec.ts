import { monitorJWT } from '../../fixtures/jwt';

describe('Can view Global Tracking Items', () => {
  beforeEach(() => {
    const baseUrl = Cypress.config('baseUrl');
    cy.intercept(baseUrl + 'api/*', (req) => {
      req.headers['Authorization'] = `Bearer ${monitorJWT}`;
    });

    cy.visit(baseUrl);
    cy.findByRole('navigation', { name: /global-training-catalog/ }).click();
  });

  it('should navigate to Global Training Catalog and show a list', () => {
    cy.url().should('include', '/Trackingitems');

    cy.findByText(/fire extinguisher/i).should('exist');
    cy.findByText(/supervisor safety training/i).should('exist');
    cy.findByText(/fire safety/i).should('exist');
    cy.findByText(/big bug safety/i).should('exist');
    cy.findByText(/keyboard warrior training/i).should('exist');
  });

  it('should filter list based on search', () => {
    cy.findByRole('textbox').type('supervisor');
    cy.findByText(/fire extinguisher/i).should('not.exist');
    cy.findByText(/supervisor safety training/i).should('exist');
    cy.findByText(/fire safety/i).should('not.exist');
    cy.findByText(/big bug safety/i).should('not.exist');
    cy.findByText(/keyboard warrior training/i).should('not.exist');
  });

  it('should create new training item', () => {
    cy.findByRole('button', { name: /add new/i }).click();

    const newTrainingItemTitle = 'New training item title';
    const newTrainingItemDescription = 'New training item description';

    cy.findByRole('textbox', { name: 'training-title-input' }).type(newTrainingItemTitle);
    cy.findByRole('textbox', { name: 'training-description-input' }).type(newTrainingItemDescription);

    cy.findByRole('button', { name: /create/i }).click();

    cy.findByText(newTrainingItemTitle).should('exist');
    cy.findByText(newTrainingItemTitle)
      .parent()
      .within((elem) => {
        cy.findByText(/Annually/i).should('exist');
      });
    cy.findByText(newTrainingItemDescription).should('exist');
  });
});
