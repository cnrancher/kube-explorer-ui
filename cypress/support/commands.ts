Cypress.Commands.add('login', (username = Cypress.env('username'), password = Cypress.env('password')) => {
  cy.intercept('POST', '/v3-public/localProviders/local*').as('loginReq');
  cy.visit('/auth/login');

  cy.byLabel('Username')
    .focus()
    .type(username);

  cy.byLabel('Password')
    .focus()
    .type(password);

  cy.get('button').click();
  cy.wait('@loginReq');
});

Cypress.Commands.add('byLabel', (label) => {
  return cy.get('.labeled-input').contains(label).siblings('input');
});
