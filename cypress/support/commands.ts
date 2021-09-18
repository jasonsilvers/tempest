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

Cypress.Commands.add('addMemberTrackingRecord', (trackingItemName: string, timesBack: number, day: string) => {
  cy.findByRole('button', { name: /add new/i, timeout: 10000 }).click();

  cy.wait(10000);

  cy.findByRole('textbox').type(trackingItemName);

  cy.findByRole('option', { name: trackingItemName }).click();

  cy.findByRole('date-picker').within(() => {
    cy.findByRole('button').click();
  });

  for (let index = 0; index < timesBack; index++) {
    cy.get('[d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"]').click();
  }

  cy.findAllByRole('button', { name: day, hidden: false }).then((elements) => {
    elements[0].click();
  });

  cy.findByRole('button', { name: /add/i }).click();
});

import '@testing-library/cypress/add-commands';
