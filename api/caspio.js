const fetch = require('node-fetch');

// Caspio API details
const clientId = 'd8454132bc944295adf1e46deec4a325dba564169b9aa49f59';
const clientSecret = 'e66f90f336814e3bba840c8a5497d4a0d19564def8c2cbdc98';
const tokenUrl = 'https://c2hcz292.caspio.com/oauth/token';

// Function to fetch Access Token
async function fetchAccessToken() {
  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
      }),
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch access token');
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error fetching access token:', error);
    throw error;
  }
}

// Function to fetch data by email from Caspio
async function fetchUserByEmail(email) {
  try {
    const token = await fetchAccessToken();
    console.log('Access Token:', token);

    // Encode the email
    const encodedEmail = encodeURIComponent(email);
    const url = `https://c2hcz292.caspio.com/rest/v2/tables/Users_tbl/records`;

    console.log('Fetching data from URL:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch data from Caspio');
    }

    const data = await response.json();
    console.log('Caspio Response Data:', data);

    // Normalize and filter users locally
    const normalizedEmail = email.toLowerCase();
    const user = data.Result.find(user => user.Email.toLowerCase() === normalizedEmail);

    if (user) {
      console.log('User found:', user);
    } else {
      console.log('User does not exist');
    }
  } catch (error) {
    console.error('Error fetching data from Caspio:', error);
  }
}

// Example email to search
const emailToSearch = 'jaba@gmail.com'; // Example with different case
fetchUserByEmail(emailToSearch);
