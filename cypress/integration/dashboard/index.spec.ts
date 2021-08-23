const memberJWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1OTkwNTMwOTUsImlhdCI6MTU5OTA1MjE5NSwiYXV0aF90aW1lIjoxNTk5MDUxMjQ1LCJqdGkiOiI3NjExNmU0Mi05ZWY4LTQ4NWItYjA5MS00NGJkNTQxOTliNzkiLCJpc3MiOiJodHRwczovL2xvZ2luLmRzb3AuaW8vYXV0aC9yZWFsbXMvYmFieS15b2RhIiwiYXVkIjoiaWw0XzE5MWY4MzZiLWVjNTAtNDgxOS1iYTEwLTFhZmFhNWI5OTYwMF9taXNzaW9uLXdpZG93Iiwic3ViIjoiMTU3NWFiMjMtMmZhNC00NTAzLTlhMjktZWU2MTJlNWZlN2EwIiwidHlwIjoiSUQiLCJhenAiOiJpbDRfMTkxZjgzNmItZWM1MC00ODE5LWJhMTAtMWFmYWE1Yjk5NjAwX21pc3Npb24td2lkb3ciLCJub25jZSI6InZ0QVlSYXdCMlU5RGhGMHhDMTJxa05GYm5PZ2NhMjhBcVZkdDd3Nl96NmMiLCJzZXNzaW9uX3N0YXRlIjoiMzM4OTQwYzYtNzM2NC00ZGYwLTk5YzItODc4Y2ExZmIyMjRjIiwiYWNyIjoiMSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJncm91cC1zaW1wbGUiOlsiSW1wYWN0IExldmVsIDIgQXV0aG9yaXplZCIsIkltcGFjdCBMZXZlbCA0IEF1dGhvcml6ZWQiLCJJbXBhY3QgTGV2ZWwgNSBBdXRob3JpemVkIl0sInByZWZlcnJlZF91c2VybmFtZSI6Impha2UuYS5qb25lcyIsImdpdmVuX25hbWUiOiJKYWtlIiwiYWN0aXZlY2FjIjoiIiwiYWZmaWxpYXRpb24iOiJVU0FGIiwiZ3JvdXAtZnVsbCI6WyIvSW1wYWN0IExldmVsIDIgQXV0aG9yaXplZCIsIi9JbXBhY3QgTGV2ZWwgNCBBdXRob3JpemVkIiwiL0ltcGFjdCBMZXZlbCA1IEF1dGhvcml6ZWQiXSwib3JnYW5pemF0aW9uIjoiVVNBRiIsIm5hbWUiOiJKYWtlIEFsZnJlZCBKb25lcyIsInVzZXJjZXJ0aWZpY2F0ZSI6IkpPTkVTLkpBS0UuQUxGUkVELjExNDMyMDk4OTAiLCJyYW5rIjoiU0dUIiwiZmFtaWx5X25hbWUiOiJKb25lcyIsImVtYWlsIjoiampAZ21haWwuY29tIn0.K8lonGpyLlCB7chNx58IIj2m1Oxj8RFV7hfAY11f3Lo';
const monitorJWT =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1OTkwNTMwOTUsImlhdCI6MTU5OTA1MjE5NSwiYXV0aF90aW1lIjoxNTk5MDUxMjQ1LCJqdGkiOiI3NjExNmU0Mi05ZWY4LTQ4NWItYjA5MS00NGJkNTQxOTliNzkiLCJpc3MiOiJodHRwczovL2xvZ2luLmRzb3AuaW8vYXV0aC9yZWFsbXMvYmFieS15b2RhIiwiYXVkIjoiaWw0XzE5MWY4MzZiLWVjNTAtNDgxOS1iYTEwLTFhZmFhNWI5OTYwMF9taXNzaW9uLXdpZG93Iiwic3ViIjoiMTU3NWFiMjMtMmZhNC00NTAzLTlhMjktZWU2MTJlNWZlN2EwIiwidHlwIjoiSUQiLCJhenAiOiJpbDRfMTkxZjgzNmItZWM1MC00ODE5LWJhMTAtMWFmYWE1Yjk5NjAwX21pc3Npb24td2lkb3ciLCJub25jZSI6InZ0QVlSYXdCMlU5RGhGMHhDMTJxa05GYm5PZ2NhMjhBcVZkdDd3Nl96NmMiLCJzZXNzaW9uX3N0YXRlIjoiMzM4OTQwYzYtNzM2NC00ZGYwLTk5YzItODc4Y2ExZmIyMjRjIiwiYWNyIjoiMSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJncm91cC1zaW1wbGUiOlsiSW1wYWN0IExldmVsIDIgQXV0aG9yaXplZCIsIkltcGFjdCBMZXZlbCA0IEF1dGhvcml6ZWQiLCJJbXBhY3QgTGV2ZWwgNSBBdXRob3JpemVkIl0sInByZWZlcnJlZF91c2VybmFtZSI6Impha2UuYS5qb25lcyIsImdpdmVuX25hbWUiOiJKYWtlIiwiYWN0aXZlY2FjIjoiIiwiYWZmaWxpYXRpb24iOiJVU0FGIiwiZ3JvdXAtZnVsbCI6WyIvSW1wYWN0IExldmVsIDIgQXV0aG9yaXplZCIsIi9JbXBhY3QgTGV2ZWwgNCBBdXRob3JpemVkIiwiL0ltcGFjdCBMZXZlbCA1IEF1dGhvcml6ZWQiXSwib3JnYW5pemF0aW9uIjoiVVNBRiIsIm5hbWUiOiJKYWtlIEFsZnJlZCBKb25lcyIsInVzZXJjZXJ0aWZpY2F0ZSI6IkpPTkVTLkpBS0UuQUxGUkVELjIyMjMzMzIyMjEiLCJyYW5rIjoiU0dUIiwiZmFtaWx5X25hbWUiOiJKb25lcyIsImVtYWlsIjoiampAZ21haWwuY29tIn0.rzFHnM2dtPJaKtrm1EhvnpO3jaqi1_DqUBJBR5nBvpI';
describe('Monitor Role', () => {
  it('Visits the site, should show dashboard and Global Training Catalog', () => {
    const baseUrl = Cypress.config('baseUrl');

    cy.intercept(baseUrl + 'api/*', (req) => {
      req.headers['Authorization'] = `Bearer ${monitorJWT}`;
    });

    cy.visit(baseUrl);

    cy.url().should('include', '/Dashboard');

    cy.findByRole('navigation', {name: /dashboard/}).should('be.visible')
    cy.findByRole('navigation', {name: /global-training-catalog/}).should('be.visible')
    cy.findByRole('heading', { name: /Dashboard/i }).should('be.visible');
  });
});

describe('Member Role', () => {
  it('Visits the site, should not show dashboard and Global Training Catalog', () => {
    const baseUrl = Cypress.config('baseUrl');

    cy.intercept(baseUrl + 'api/**', (req) => {
      req.headers['Authorization'] = `Bearer ${memberJWT}`;
    });

    cy.visit(baseUrl);

    cy.wait(2000)
    cy.url().should('include', '/Profile');

    cy.contains(/dashboad/i).should('not.exist')
    cy.contains(/global-training-catalog/).should('not.exist')
  });
});
