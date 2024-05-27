describe('Authentication Tests', () => {
  const apiUrl = 'http://localhost:9090/api'; // Replace with your actual API URL
  const validUser = {
    number: '+19259845116', 
    password: '123456'
  };
  const invalidUser = {
    number: 'invalid_number',
    password: 'invalid_password'
  };

  let authToken; // Variable to store the auth token

  it('should sign in successfully with valid credentials', () => {
    // Sign in the user
    cy.request({
      method: 'POST',
      url: `${apiUrl}/signin`,
      body: validUser,
      failOnStatusCode: false
    }).then((signinResponse) => {
      expect(signinResponse.status).to.eq(200);
      expect(signinResponse.body).to.have.property('token');
      authToken = signinResponse.body.token; // Save the token to a variable
    });
  });

  it('should fail to sign in with invalid credentials', () => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/signin`,
      body: invalidUser,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  it('should sign out successfully', () => {
    // Ensure the token is available before making the sign-out request
    cy.wrap(authToken).should('not.be.undefined').then((token) => {
      cy.request({
        method: 'POST',
        url: `${apiUrl}/signout`,
        headers: {
          Authorization: token
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });
  });
});
