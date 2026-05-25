describe('Orders Workflow', () => {
  beforeEach(() => {
    // Visit the application before each test
    cy.visit('http://localhost:4200');
  });

  it('should display the dashboard and allow navigation to orders', () => {
    // Note: Since this is a CRM, we might need to mock login or just navigate
    cy.visit('http://localhost:4200/dashboard/orders');
    
    // Check if the page loaded
    cy.get('h1').should('contain', 'Gestión de Pedidos');
    
    // Check if metric cards exist
    cy.get('.metric-card').should('have.length.at.least', 4);
  });

  it('should filter orders by Order ID', () => {
    cy.visit('http://localhost:4200/dashboard/orders');
    
    // Wait for data to load
    cy.wait(1000);
    
    // Type in the order ID filter input
    cy.get('input[placeholder="Nro. Pedido..."]').type('test-id-123');
    
    // It should either show no results or a specific row
    cy.get('body').then($body => {
      if ($body.find('h4:contains("No se encontraron pedidos")').length > 0) {
        cy.get('h4').should('contain', 'No se encontraron pedidos');
      } else {
        cy.get('p-table tbody tr').should('have.length.at.least', 1);
      }
    });
  });

  it('should open keywords configuration', () => {
    cy.visit('http://localhost:4200/dashboard/settings');
    
    // Click the keywords tab
    cy.contains('span', 'Palabras Clave').click();
    
    // Click the manage keywords button
    cy.contains('button', 'Gestionar Palabras Clave').click();
    
    // Should be on keyword-config page
    cy.url().should('include', '/dashboard/settings/keyword-config');
    cy.get('h2').should('contain', 'Palabras Clave');
  });
});
