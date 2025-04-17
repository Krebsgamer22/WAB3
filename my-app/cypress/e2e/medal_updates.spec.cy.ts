/// <reference types="cypress" />
/// <reference types="../support" />
/// <reference types="chai" />

describe('Medal Updates Flow', () => {
  before(() => {
    cy.seedDatabase();
    cy.visit('/athletes/1');
  });

  it('should update medals after new performance entry', () => {
    // Get initial medal count
    let initialGold: number;
    
    cy.get('[data-cy="gold-medal-count"]').invoke('text').then((text) => {
      initialGold = parseInt(text);
    });
    
    // Enter new performance
    cy.get('[data-cy="performance-input"]').type('9.81');
    cy.get('[data-cy="submit-performance"]').click();
    
    // Verify medal update
    cy.get('[data-cy="gold-medal-count"]').should(($el) => {
      const currentGold = parseInt($el.text());
      expect(currentGold).to.be.greaterThan(initialGold);
    });
  });
});
