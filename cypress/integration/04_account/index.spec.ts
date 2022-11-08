describe('Member role', () => {
  it('should update personal fields', () => {
    cy.loginAsMember();
    cy.url().should('include', '/Profile');

    cy.findByRole('navigation', { name: /account-settings/ }).click();
    
    cy.findByRole('textbox', {
      name: /firstname/i
    }).should('have.value', 'Scarlet')

    cy.findByRole('textbox', {
      name: /firstname/i
    }).clear().type('New First Name')

    cy.findByRole('textbox', {
      name: /lastname/i
    }).should('have.value', 'Member')

    cy.findByRole('textbox', {
      name: /lastname/i
    }).clear().type('New last Name')

    cy.findByRole('button', {
      name: /ssgt\/e\-5/i
    }).click()

    cy.findByRole('option', {
      name: /msgt\/e\-7/i
    }).click()

    cy.findByRole('button', {
      name: /update/i
    }).click()

    cy.findByText(/profile updated!/i).should('be.visible')
    
  });
})

describe('Montior role', () => {
  it('should update work fields', () => {
    cy.loginAsMonitor();
    cy.url().should('include', '/Dashboard');

    cy.findByRole('navigation', { name: /account-settings/ }).click();

    cy.findByRole('tab', {
      name: /work/i
    }).click()
    
    cy.findByRole('textbox', {
      name: /afsc/i
    }).clear().type('new afsc')

    cy.findByRole('textbox', {
      name: /dutytitle/i
    }).clear().type('new duty title')

    cy.findByRole('button', {
      name: /update/i
    }).click()

    cy.findByText(/profile updated!/i).should('be.visible')
    
  });

  it('should not set role to member if reporting organization is changed', () => {
    cy.loginAsMonitor();
    cy.url().should('include', '/Dashboard');

    cy.contains(/dashboard/i).should('exist');
    cy.findByRole('navigation', {
      name: /global\-training\-catalog/i
    }).should('exist');

    cy.findByRole('navigation', { name: /account-settings/ }).click();

    cy.findByRole('tab', {
      name: /monitor/i
    }).click()
    
    cy.findByRole('button', {
      name: /15th medical group/i
    }).click()

    cy.findByRole('option', {
      name: /lrs/i
    }).click()
    
    cy.findByRole('button', {
      name: /update/i
    }).click()


    cy.findByText(/profile updated!/i).should('be.visible')

    cy.contains(/dashboard/i).should('exist');
    cy.findByRole('navigation', {
      name: /global\-training\-catalog/i
    }).should('exist');

  });

  it('should set role to member if organization is changed', () => {
    cy.loginAsMonitor();
    cy.url().should('include', '/Dashboard');

    cy.contains(/dashboard/i).should('exist');
    cy.findByRole('navigation', {
      name: /global\-training\-catalog/i
    }).should('exist');

    cy.findByRole('navigation', { name: /account-settings/ }).click();

    cy.findByRole('tab', {
      name: /work/i
    }).click()
    
    cy.findByRole('button', {
      name: /15th medical group/i
    }).click()

    cy.findByRole('option', {
      name: /lrs/i
    }).click()

    cy.findByRole('button', {
      name: /update/i
    }).click()

    cy.findByText(/profile updated!/i).should('be.visible')

    cy.contains(/dashboard/i).should('not.exist');
    cy.findByRole('navigation', {
      name: /global\-training\-catalog/i
    }).should('not.exist');
    
  });

})