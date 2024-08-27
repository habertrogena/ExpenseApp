const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const mysql = require("mysql2");
const cors = require("cors"); // Import the CORS package

const app = express();
app.use(bodyParser.json());

// Enable CORS for all routes
app.use(cors({
  origin: 'https://c2hcz292.caspio.com', // Replace with your Caspio domain
}));

const clientId = "d8454132bc944295adf1e46deec4a325dba564169b9aa49f59";
const clientSecret = "e66f90f336814e3bba840c8a5497d4a0d19564def8c2cbdc98";
const tokenUrl = "https://c2hcz292.caspio.com/oauth/token";
const baseUrl = "https://c2hcz292.caspio.com/rest/v2/tables/Users_tbl/records";

// MySQL database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "habert@12",
  database: "caspio",
});

// Connect to MySQL
db.connect((error) => {
  if (error) {
    console.log("Error connecting to MySQL database");
    return;
  }
  console.log("Connected to MySQL database successfully");
});

// Function to get the access token
async function getAccessToken() {
  try {
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        
      }),
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },

    });

    if (!response.ok) {
      throw new Error("Failed to get access token");
    }

    const data = await response.json();
    console.log("Access Token:", data.access_token);

    return data.access_token;
  } catch (error) {
    console.error("Failed to get access token:", error.message);
    throw new Error("Failed to get access token");
  }
}


// Function to fetch a user by email from Caspio
async function fetchUserByEmail(email) {
  try {
    // Fetch the access token
    const token = await getAccessToken();
    console.log('Access Token:', token);

    // Encode the email
    const encodedEmail = encodeURIComponent(email);
    // Add a unique query parameter to avoid caching issues
    const uniqueId = new Date().getTime();
    const url = `${baseUrl}?q={"filter":"Email eq '${encodedEmail}'"}&cache_bust=${uniqueId}`;

    console.log('Fetching data from URL:', url);

    // Fetch user data from Caspio
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
      return user;
    } else {
      console.log('User does not exist');
      return null;
    }
  } catch (error) {
    console.error('Error fetching data from Caspio:', error);
    throw error; // Rethrow error to be handled by calling code if necessary
  }
}


// Route handler for finding a user
app.get("/find-user/:email", async (req, res) => {
  const email = req.params.email;
  const normalizedEmail = email.toLowerCase();

  console.log("Searching for email:", email);

  // Check local database
  db.query(
    "SELECT * FROM Users WHERE Email = ?",
    [normalizedEmail],
    async (error, results) => {
      if (error) {
        return res.status(500).json({ error: "Local database query failed" });
      }
      if (results.length > 0) {
        return res.status(200).json({ source: "local database", user: results[0] });
      }

      // Check Caspio database
     const user = await fetchUserByEmail(email);
     if (user) {
      return res.status(200).json({ source: 'caspio database', user });
    } else {
      return res.status(404).json({ message: 'User not found' });
    }

    }
  );
});

// Route handler for creating a user
app.post("/create-user", async (req, res) => {
  const modifiedTaskData = {
    Names: "wilson Kiplagat",
    Email: "wilson@gmail.com",
    Phone_Number: "0731305187",
  };

  try {
    const accessToken = await getAccessToken();

    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(modifiedTaskData),
    });

    const responseBody = await response.text();

    console.log("Response Status:", response.status);
    console.log("Response Body:", responseBody);

    if (!response.ok) {
      throw new Error("Failed to create user");
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Failed to create user:", error.message);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  try {
    await getAccessToken();
  } catch (error) {
    console.error("Error during startup:", error.message);
  }
});
