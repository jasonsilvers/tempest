import { getToday } from '../../support/utils';

describe('Member role', () => {
  it('should show No items', () => {
    cy.loginAsMember();
    cy.wait(5000);
    cy.findAllByText(/nothing to show/i).should('have.length', 2);
  });

  it('should add new training and be able to sign', () => {
    cy.loginAsMember();

    const trackingItemName = 'Fire Extinguisher';
    cy.addMemberTrackingRecord(trackingItemName, getToday());

    cy.findByRole('button', { name: /awaiting signature/i }).should('exist');
    cy.findByRole('button', { name: 'signature_button' }).should('exist');
    cy.findByRole('button', { name: 'signature_button' }).click();

    cy.cleanUpRecords();
    cy.findByText(/fire extinguisher/i).should('not.exist');
  });

  it('should change profile data in the header then cancel save', () => {
    cy.loginAsMember();
    cy.findByRole('button', { name: 'edit-user' }).click();
    cy.intercept('/api/organizations');
    cy.findByText(/loading/).should('not.exist');
    cy.findByRole('textbox', { name: /rank/i }).click();
    cy.findByRole('option', { name: /SSgt/i }).click();
    cy.findByRole('textbox', { name: /afsc/i }).clear().type('3D0X4');
    cy.findByRole('textbox', { name: /organization/i }).click();
    cy.findByRole('option', { name: /dental/i }).click();
    cy.findByRole('button', { name: /cancel/i }).click();
  });

  it('should change profile data in the header then save', () => {
    cy.loginAsMember();
    cy.findByRole('button', { name: 'edit-user' }).click();
    cy.intercept('/api/organizations');
    cy.findByText(/loading/).should('not.exist');
    cy.findByRole('textbox', { name: /rank/i }).click();
    cy.findByRole('option', { name: /SSgt/i }).click();
    cy.findByRole('textbox', { name: /afsc/i }).clear().type('3D0X4');
    cy.findByRole('textbox', { name: /organization/i }).click();
    cy.findByRole('option', { name: /dental/i }).click();
    cy.findByRole('button', { name: /save/i }).click();
    cy.findByText(/dental/i).should('exist');
  });
  

  it('should be able to complete record if already signed by training monitor - part 1', () => {
    const baseUrl = Cypress.config('baseUrl');
    cy.loginAsMonitor();
    cy.visit(baseUrl + 'Dashboard');
    cy.findByText(/member, scarlet/i)
      .parent()
      .within((elem) => {
        cy.findByRole('button', { name: /member-popup-menu/i }).click();
        cy.focused().click();
      });
    const trackingItemName = 'Fire Extinguisher';

    cy.addMemberTrackingRecord(trackingItemName, getToday());
    cy.findByRole('button', { name: 'signature_button' }).click();

    cy.findByRole('alert').should('be.visible');
  });

  it('should be able to complete record if already signed by training monitor - part 2', () => {
    cy.loginAsMember();
    cy.findByRole('button', { name: 'signature_button' }).click();
    cy.findByText(/signatures present/i).should('be.visible');
  });

  it('should be able to delete record', () => {
    cy.loginAsMember();
    const trackingItemName = 'Fire Extinguisher';

    cy.addMemberTrackingRecord(trackingItemName, getToday());
    cy.findByText(/fire extinguisher/i).should('be.visible');
    cy.findAllByRole('button', { name: /delete-tracking-record/i }).click({ multiple: true });
    cy.contains(/fire extinguisher/i).should('not.exist');
  });
  it('should not be able to delete record if signed by monitor - part 1', () => {
    const baseUrl = Cypress.config('baseUrl');
    cy.loginAsMonitor();
    cy.visit(baseUrl + 'Dashboard');
    cy.findByText(/member, scarlet/i)
      .parent()
      .within((elem) => {
        cy.findByRole('button', { name: 'member-popup-menu' }).click();
        cy.focused().click();
      });
    const trackingItemName = 'Fire Extinguisher';

    //This tracking record is used in (should complete record and replace the old one)
    cy.addMemberTrackingRecord(trackingItemName, getToday(1));
    cy.findByRole('button', { name: 'signature_button' }).click();
  });
  it('should not be able to delete record if signed by monitor - part 2', () => {
    cy.loginAsMember();
    cy.findAllByRole('button', { name: /delete-tracking-record/i, timeout: 20000 }).should('be.disabled');
  });

  it('should complete record and replace the old one', () => {
    cy.loginAsMember();
    cy.findByRole('button', { name: 'signature_button' }).click();

    const oldDate = getToday(1);
    const date = getToday();

    cy.findByText(date).should('exist');
    cy.findByText(oldDate).should('not.exist');
  });
});

describe('Monitor role', () => {
  it('should show training record for selected member', () => {
    cy.loginAsMonitor();
    cy.findByText(/member, scarlet/i)
      .parent()
      .within((elem) => {
        cy.findByRole('button', { name: 'member-popup-menu' }).click();
        cy.focused().click();
      });

    const trackingItemName = 'Fire Extinguisher';

    cy.addMemberTrackingRecord(trackingItemName, getToday());

    cy.findByRole('button', { name: /awaiting signature/i }).should('exist');
    cy.findByRole('button', { name: 'signature_button' }).should('exist');
    cy.findByRole('button', { name: 'signature_button' }).click();
    cy.findByRole('button', { name: /signed on/i }).should('exist');
    cy.findByRole('button', { name: /awaiting signature/i }).should('exist');
    cy.cleanUpRecords();
  });
  it('should be able to delete record even if signed but not complete', () => {
    const baseUrl = Cypress.config('baseUrl');
    cy.loginAsMonitor();
    cy.visit(baseUrl + 'Dashboard');
    cy.findByText(/member, scarlet/i)
      .parent()
      .within((elem) => {
        cy.findByRole('button', { name: 'member-popup-menu' }).click();
        cy.focused().click();
      });

    const trackingItemName = 'Fire Extinguisher';

    cy.addMemberTrackingRecord(trackingItemName, getToday());
    cy.findByRole('button', { name: 'signature_button' }).click();
    cy.findAllByRole('button', { name: /delete-tracking-record-/i }).should('not.be.disabled');
  });

  it('should change profile data in the header but prompt user of permission change', () => {
    cy.loginAsMonitor();
    cy.findByText(/profile/i).click();
    cy.findByRole('button', { name: 'edit-user' }).click();
    cy.intercept('/api/organizations');
    cy.findByText(/loading/).should('not.exist');
    cy.findByRole('textbox', { name: /rank/i }).click();
    cy.findByRole('option', { name: /SSgt/i }).click();
    cy.findByRole('textbox', { name: /afsc/i }).clear().type('3D0X4');
    cy.findByRole('textbox', { name: /organization/i }).click();
    cy.findByRole('option', { name: /dental/i }).click();
    cy.findByRole('button', { name: /no/i }).click();
    cy.findByRole('button', { name: /cancel/i }).click();
    cy.findByText(/dental/).should('not.exist');
  });
});
