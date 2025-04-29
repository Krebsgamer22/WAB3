/// <reference types="cypress" />
/// <reference types="../support" />

describe('Error Handling', () => {
  beforeEach(() => {
    cy.seedDatabase();
    cy.visit('/upload');
  });

  it('should detect duplicate athlete entries', () => {
    // First upload (success)
    cy.fixture('athletes.csv').then((fileContent) => {
      cy.get('[data-cy="csv-upload-input"]').selectFile({
        contents: fileContent,
        fileName: 'athletes.csv',
        mimeType: 'text/csv'
      });
    });
    cy.contains('Upload successful').should('be.visible');

    // Second upload (duplicate error)
    cy.fixture('athletes.csv').then((fileContent) => {
      cy.get('[data-cy="csv-upload-input"]').selectFile({
        contents: fileContent,
        fileName: 'athletes.csv',
        mimeType: 'text/csv'
      });
    });
    cy.contains('Duplicate entry detected for: John Doe, Jane Smith').should('be.visible');
  });
});
