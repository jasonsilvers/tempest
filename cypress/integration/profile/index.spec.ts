describe('Member role', () => {
  it('should show No items', () => {
    cy.loginAsMember();
    cy.wait(5000);
    cy.findAllByText(/nothing to show/i).should('have.length', 2);
  });

  it('should add new training and be able to sign', () => {
    cy.loginAsMember();

    cy.findByRole('button', { name: /add new/i }).click();

    cy.wait(10000);

    cy.findByRole('textbox').type('fire extinguisher');
    cy.findByText(/fire extinguisher/i).click();

    cy.get('#date').type('2021-10-01');
    cy.findByRole('button', { name: /add/i }).click();

    cy.findByText(/fire extinguisher/i).should('exist');

    cy.findByRole('button', { name: /awaiting signature/i }).should('exist');
    cy.findByRole('button', { name: 'signature_button' }).should('exist');
    cy.findByRole('button', { name: 'signature_button' }).click();

    cy.cleanUpRecords();
    cy.findByText(/fire extinguisher/i).should('not.exist');
  });

  it('should be able to complete record if already signed by training monitor - part 1', () => {
    const baseUrl = Cypress.config('baseUrl');
    cy.loginAsMonitor();
    cy.visit(baseUrl + 'Dashboard');
    cy.findByText(/clark,sandra/i).click();
    const trackingItemName = 'Fire Extinguisher';

    cy.addMemberTrackingRecord(trackingItemName);
    cy.findByRole('button', { name: 'signature_button' }).click();

    cy.findByRole('alert').should('be.visible');
  });

  it('should be able to complete record if already signed by training monitor - part 2', () => {
    cy.loginAsMember();
    cy.findByRole('button', { name: 'signature_button' }).click();
    cy.findByText(/signatures present/i).should('be.visible');
  });
});

describe('Monitor role', () => {
  it('should show training record for selected member', () => {
    cy.loginAsMonitor();
    cy.findByText(/clark,sandra/i).click();

    const trackingItemName = 'Fire Extinguisher';

    cy.addMemberTrackingRecord(trackingItemName);

    cy.findByRole('button', { name: /awaiting signature/i }).should('exist');
    cy.findByRole('button', { name: 'signature_button' }).should('exist');
    cy.findByRole('button', { name: 'signature_button' }).click();
    cy.findByRole('button', { name: /signed on/i }).should('exist');
    cy.findByRole('button', { name: /awaiting signature/i }).should('exist');
    cy.cleanUpRecords();
  });
});
