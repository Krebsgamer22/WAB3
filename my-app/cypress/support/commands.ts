/// <reference types="cypress" />
/// <reference types="../support" />

/// <reference types="../support" />

Cypress.Commands.add('seedDatabase', () => {
  cy.exec('npx prisma migrate reset --force', {failOnNonZeroExit: false})
    .its('code').should('eq', 0);
  cy.exec('npx prisma db seed', {failOnNonZeroExit: false})
    .its('code').should('eq', 0);
});
