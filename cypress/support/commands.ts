// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

import { monitorJWT, memberJWT } from '../fixtures/jwt';

Cypress.Commands.add('dataCy', (value) => {
  return cy.get(`[data-cy=${value}]`);
});

Cypress.Commands.add('cleanUpRecords', () => {
  cy.findAllByRole('button', { name: /delete-tracking-record/i }).click({ multiple: true });
});

Cypress.Commands.add('loginAsMonitor', () => {
  const baseUrl = Cypress.config('baseUrl');
  cy.intercept(baseUrl + 'api/**', (req) => {
    req.headers['Authorization'] = `Bearer ${monitorJWT}`;
  });

  cy.visit(baseUrl);
});

Cypress.Commands.add('loginAsMember', () => {
  const baseUrl = Cypress.config('baseUrl');
  cy.intercept(baseUrl + 'api/**', (req) => {
    req.headers['Authorization'] = `Bearer ${memberJWT}`;
  });

  cy.visit(baseUrl);
});

Cypress.Commands.add('addMemberTrackingRecord', (trackingItemName: string, date: string) => {
  cy.findByRole('button', { name: /add new/i, timeout: 10000 }).click();

  cy.wait(10000);

  cy.findByRole('combobox').type(trackingItemName);

  cy.findByRole('option', { name: trackingItemName }).click();

  cy.findByLabelText(/choose date/i).click();

  cy.findByLabelText(date).click();

  cy.findByRole('button', { name: /add/i }).click();
});

import '@testing-library/cypress/add-commands';
