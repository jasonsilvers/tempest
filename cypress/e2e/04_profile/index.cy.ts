import { getToday } from '../../support/utils';

describe('Member role', () => {
  it('should show No items', () => {
    cy.loginAsMember();
    cy.wait(5000);
    cy.findAllByText(/nothing to show/i).should('have.length', 1);
  });

  it('should add new training and be able to sign', () => {
    cy.loginAsMember();

    const trackingItemName = 'GLOBAL - Fire Extinguisher';
    cy.findByRole('button', { name: /add/i, timeout: 10000 }).click();

    cy.wait(10000);

    //Make sure member can only see items that are in org and above
    cy.findByRole('combobox').type('PHARMACY');
    cy.findByText(/no options/i).should('exist')
    cy.get('[data-testid="CloseIcon"]').click()

    cy.addMemberTrackingRecord(trackingItemName, getToday());
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
    cy.findAllByRole('button', {
      name: /rows per page: 5/i
    }).first().click()
    cy.findByRole('option', {
      name: /25/i
    }).click()
    cy.findByText(/member, scarlet/i)
      .parent()
      .within(() => {
        cy.findByRole('button', { name: /member-popup-menu/i }).click();
        cy.focused().click();
      });
    const trackingItemName = 'GLOBAL - Fire Extinguisher';

    cy.addMemberTrackingRecord(trackingItemName, getToday());
    cy.findByRole('button', { name: 'signature_button' }).click();

    cy.findByRole('alert').should('be.visible');
  });

  it('should be able to complete record if already signed by training monitor - part 2', () => {
    cy.loginAsMember();
    
    cy.findByRole('button', { name: 'signature_button' }).click();

    cy.findByRole('button', {name: /training in progress/i}).click()
    cy.findByRole('option', {
      name: /offical training record/i
    }).click()
    cy.findAllByText(/signatures present/i).should('be.visible');
  });

  it('should be able to delete record', () => {
    cy.loginAsMember();
    const trackingItemName = 'GLOBAL - Fire Extinguisher';

    cy.addMemberTrackingRecord(trackingItemName, getToday());
    cy.findByText(/fire extinguisher/i).should('be.visible');
    cy.findAllByRole('button', { name: /delete-tracking-record/i }).click({ multiple: true });
    cy.contains(/fire extinguisher/i).should('not.exist');
  });
  it('should not be able to delete record if signed by monitor - part 1', () => {
    const baseUrl = Cypress.config('baseUrl');
    cy.loginAsMonitor();
    cy.visit(baseUrl + 'Dashboard');
    cy.findAllByRole('button', {
      name: /rows per page: 5/i
    }).first().click()
    cy.findByRole('option', {
      name: /25/i
    }).click()
    cy.findByText(/member, scarlet/i)
      .parent()
      .within(() => {
        cy.findByRole('button', { name: 'member-popup-menu' }).click();
        cy.focused().click();
      });
    const trackingItemName = 'GLOBAL - Fire Extinguisher';

    //This tracking record is used in (should complete record and replace the old one)
    cy.addMemberTrackingRecord(trackingItemName, getToday(1));
    cy.findByRole('button', { name: 'signature_button' }).click();
    cy.findByRole('alert').should('be.visible');

  });
  it('should not be able to delete record if signed by monitor - part 2', () => {
    cy.loginAsMember();
    cy.findAllByRole('button', { name: /delete-tracking-record/i, timeout: 20000 }).should('be.disabled');
  });

  it('should complete record and replace the old one', () => {
    cy.loginAsMember();
    cy.findByRole('button', { name: 'signature_button' }).click();

    cy.findByRole('button', {name: /training in progress/i}).click()
    cy.findByRole('option', {
      name: /offical training record/i
    }).click()

    const oldDate = getToday(1);
    const date = getToday();

    cy.findByText(date).should('exist');
    cy.findByText(oldDate).should('not.exist');
  });

  it('should not be able to archive training', () => {
    cy.loginAsMember();

    cy.findByRole('button', {name: /training in progress/i}).click()
    cy.findByRole('option', {
      name: /offical training record/i
    }).click()

    cy.findAllByRole('button', {
        name: /archive-tracking-record/i
    }).should('not.exist')
  });
});

describe('Monitor role', () => {
  it('should show training record for selected member', () => {
    cy.loginAsMonitor();
    cy.findAllByRole('button', {
      name: /rows per page: 5/i
    }).first().click()
    cy.findByRole('option', {
      name: /25/i
    }).click()
    cy.findByText(/member, scarlet/i)
      .parent()
      .within(() => {
        cy.findByRole('button', { name: 'member-popup-menu' }).click();
        cy.focused().click();
      });

    const trackingItemName = 'GLOBAL - Fire Extinguisher';

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
    cy.findAllByRole('button', {
      name: /rows per page: 5/i
    }).first().click()
    cy.findByRole('option', {
      name: /25/i
    }).click()
    cy.findByText(/member, scarlet/i)
      .parent()
      .within(() => {
        cy.findByRole('button', { name: 'member-popup-menu' }).click();
        cy.focused().click();
      });

    const trackingItemName = 'GLOBAL - Fire Safety';

    cy.addMemberTrackingRecord(trackingItemName, getToday());
    cy.findByRole('button', { name: 'signature_button' }).click();
    cy.findAllByRole('button', { name: /delete-tracking-record-/i }).should('not.be.disabled');
    cy.findAllByTestId('DeleteIcon').click({multiple: true})
    cy.findByRole('alert').should('be.visible');

  });

  it('should be able to archive record', () => {
    const baseUrl = Cypress.config('baseUrl');
    cy.loginAsMonitor();
    cy.visit(baseUrl + 'Dashboard');
    cy.findAllByRole('button', {
      name: /rows per page: 5/i
    }).first().click()
    cy.findByRole('option', {
      name: /25/i
    }).click()
    cy.findByText(/member, scarlet/i)
      .parent()
      .within(() => {
        cy.findByRole('button', { name: 'member-popup-menu' }).click();
        cy.focused().click();
      });

    cy.findByRole('button', {name: /training in progress/i}).click()
    cy.findByRole('option', {
      name: /offical training record/i
    }).click()

    cy.findByText(/global - fire extinguisher/i).should('exist')
    cy.findAllByRole('button', {
        name: /archive-tracking-record/i
      }).first().within(() => {
        cy.findByTestId('ArchiveIcon').click()
      });

    
    cy.findByRole('alert').should('be.visible');
    cy.findByText(/global - fire extinguisher/i).should('not.exist')

    cy.findByRole('button', {
      name: /view archive/i
    }).click()

    cy.findByText(/global - fire extinguisher/i).should('exist')
    cy.findByRole('button', {
      name: /unarchive/i
    }).click()
    cy.findByRole('alert').should('be.visible');
    cy.findByText(/global - fire extinguisher/i).should('not.exist')

    cy.findByRole('button', {
      name: /view training record/i
    }).click()

    cy.findByRole('button', {name: /training in progress/i}).click()
    cy.findByRole('option', {
      name: /offical training record/i
    }).click()
    cy.findByText(/global - fire extinguisher/i).should('exist')

  });
});
