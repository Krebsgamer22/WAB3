/// <reference types="cypress" />
/// <reference types="chai" />

declare global {
  namespace Cypress {
    interface Chainable {
      seedDatabase(): Chainable<void>
      selectFile(options: {
        contents: string
        fileName: string
        mimeType: string
      }): Chainable<void>
    }
  }
}

// Export empty object to mark file as module
export {}
