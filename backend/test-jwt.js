const jwt = require('jsonwebtoken');

const secret = 'LPkJ3SIJf/HGid0hD8y4HxxwBWYikZPdEE5K6CMJLwTXRbJRlcnQ8rbjE9NUWQ/s40E233eImNLItdYEaMkAcQ==';

// Create a test JWT token
const payload = {
  sub: 'test-user-id',
  email: 'test@example.com',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
};

const token = jwt.sign(payload, secret);
console.log('Generated token:', token);

// Test if we can verify it
try {
  const decoded = jwt.verify(token, secret);
  console.log('Token verified successfully:', decoded);
} catch (error) {
  console.error('Token verification failed:', error.message);
}

// Test the API with this token
async function testAPI() {
  try {
    const response = await fetch('http://localhost:8888/user-health/goals', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('API Response status:', response.status);
    const text = await response.text();
    console.log('API Response:', text);
  } catch (error) {
    console.error('API test failed:', error);
  }
}

testAPI();