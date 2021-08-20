const jwt =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1OTkwNTMwOTUsImlhdCI6MTU5OTA1MjE5NSwiYXV0aF90aW1lIjoxNTk5MDUxMjQ1LCJqdGkiOiI3NjExNmU0Mi05ZWY4LTQ4NWItYjA5MS00NGJkNTQxOTliNzkiLCJpc3MiOiJodHRwczovL2xvZ2luLmRzb3AuaW8vYXV0aC9yZWFsbXMvYmFieS15b2RhIiwiYXVkIjoiaWw0XzE5MWY4MzZiLWVjNTAtNDgxOS1iYTEwLTFhZmFhNWI5OTYwMF9taXNzaW9uLXdpZG93Iiwic3ViIjoiMTU3NWFiMjMtMmZhNC00NTAzLTlhMjktZWU2MTJlNWZlN2EwIiwidHlwIjoiSUQiLCJhenAiOiJpbDRfMTkxZjgzNmItZWM1MC00ODE5LWJhMTAtMWFmYWE1Yjk5NjAwX21pc3Npb24td2lkb3ciLCJub25jZSI6InZ0QVlSYXdCMlU5RGhGMHhDMTJxa05GYm5PZ2NhMjhBcVZkdDd3Nl96NmMiLCJzZXNzaW9uX3N0YXRlIjoiMzM4OTQwYzYtNzM2NC00ZGYwLTk5YzItODc4Y2ExZmIyMjRjIiwiYWNyIjoiMSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJncm91cC1zaW1wbGUiOlsiSW1wYWN0IExldmVsIDIgQXV0aG9yaXplZCIsIkltcGFjdCBMZXZlbCA0IEF1dGhvcml6ZWQiLCJJbXBhY3QgTGV2ZWwgNSBBdXRob3JpemVkIl0sInByZWZlcnJlZF91c2VybmFtZSI6Impha2UuYS5qb25lcyIsImdpdmVuX25hbWUiOiJKYWtlIiwiYWN0aXZlY2FjIjoiIiwiYWZmaWxpYXRpb24iOiJVU0FGIiwiZ3JvdXAtZnVsbCI6WyIvSW1wYWN0IExldmVsIDIgQXV0aG9yaXplZCIsIi9JbXBhY3QgTGV2ZWwgNCBBdXRob3JpemVkIiwiL0ltcGFjdCBMZXZlbCA1IEF1dGhvcml6ZWQiLCIvdHJvbi9yb2xlcy9hZG1pbiJdLCJvcmdhbml6YXRpb24iOiJVU0FGIiwibmFtZSI6Ikpha2UgQWxmcmVkIEpvbmVzIiwidXNlcmNlcnRpZmljYXRlIjoiSk9ORVMuSkFLRS5BTEZSRUQuMjIyMzMzMjIyMSIsInJhbmsiOiJTR1QiLCJmYW1pbHlfbmFtZSI6IkpvbmVzIiwiZW1haWwiOiJqakBnbWFpbC5jb20ifQ._JgnSL9HW0izxqP-KV82ckfzq8oywx-iatwS3WE44hg';

describe('Main', () => {
  it('Visits the site', () => {
    const baseUrl = Cypress.config('baseUrl');

    cy.intercept(baseUrl + 'api/*', (req) => {
      req.headers['Authorization'] = `Bearer ${jwt}`;
    });
    cy.visit(baseUrl);

    cy.url().should('include', '/Dashboard');

    cy.findByRole('heading', {name: /Dashboard/i}).should('be.visible');
    
  });
});
