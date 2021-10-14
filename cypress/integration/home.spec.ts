import { TopLevelMenu } from '~/cypress/integration/util/toplevelmenu';

describe('Home Page', () => {
  beforeEach(() => {
    cy.login();
  });

  it('Renders', () => {
    // cy.visit('/home');
    cy.get('.title').contains('Welcome');
  });

  it('Has a top-level nav menu', () => {
    const topLevelMenu = new TopLevelMenu();

    topLevelMenu.toggle();
  });
});
