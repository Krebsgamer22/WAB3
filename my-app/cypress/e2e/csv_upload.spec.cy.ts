/// <reference types="cypress" />

describe('CSV Upload Flow', () => {
  beforeEach(() => {
    cy.visit('/upload');
  });

  it('should upload athletes CSV successfully', () => {
    cy.fixture('athletes.csv').then((fileContent: string) => {
      cy.get('[data-cy="csv-upload-input"]').selectFile({
        contents: fileContent,
        fileName: 'athletes.csv',
        mimeType: 'text/csv'
      });
      cy.contains('Upload successful').should('be.visible');
      cy.get('[data-cy="athlete-table"] tr').should('have.length.gt', 1);
    });
  });

  it('should upload performances CSV successfully', () => {
    cy.fixture('performances.csv').then((fileContent) => {
      cy.get('[data-cy="csv-upload-input"]').selectFile({
        contents: fileContent,
        fileName: 'performances.csv',
        mimeType: 'text/csv'
      });
      cy.contains('Upload successful').should('be.visible');
      cy.get('[data-cy="performance-table"] tr').should('have.length.gt', 1);
    });
  });
});
