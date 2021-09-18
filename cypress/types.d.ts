// describe custom Cypress commands in this file

// load the global Cypress types
/// <reference types="cypress" />
// load the 3rd party command definition for cy.waitUntil()

declare namespace Cypress {
  interface Chainable<Subject = any> {
    /**
     * Custom command to select DOM element by data-cy attribute.
     * @example cy.dataCy('greeting')
     */
    dataCy(value: string): Chainable<Element>;
    cleanUpRecords(): Chainable<Element>;
    loginAsMonitor(): Chainable<Element>;
    loginAsMember(): Chainable<Element>;
    addMemberTrackingRecord(trackingItemName: string, timesBack: number, day: string): Chainable<Element>;

    /**
     * Custom command that adds two given numbers
     */
  }
}
