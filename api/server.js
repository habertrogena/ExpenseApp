const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const cors = require("cors");
const path = require('path')
const dotenv = require("dotenv");



const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

dotenv.config();



//create a database connection.
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

db.connect((err) => {

  if (err) return console.log("error connecting to mysql", err);
  console.log("connected to mysql sucessfully");

  // create a database
  db.query(`CREATE DATABASE IF NOT EXISTS caspio`, (err, results) => {
    if (err) return console.log(err);
    console.log("Database caspio created sucessfully");

    //select the database
    db.changeUser({ database: "caspio" }, (err) => {
      console.log("changed to caspio");

      // create a users table
      const createUserTable = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(100) NOT NULL UNIQUE,
                username VARCHAR(50) NOT NULL ,
                password VARCHAR(255) NOT NULL
            )
            `;
      db.query(createUserTable, (err, result) => {
        if (err) return console.log(err);
        console.log("users table created sucessfully");
      });


      //create a payment table
      const createPaymentTable = `
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        date DATE NOT NULL,
        type VARCHAR(50) NOT NULL
      )
      `
    db.query(createPaymentTable, (err, result) => {
      if (err) return console.log(err);
      console.log(" payment table created sucessfully");
    });

    });
  });
});

//logic to create a simple user registration route and store the user details in the db

app.post("/api/register", async (req, res) => {
  try {

    const { email, username, password } = req.body;

    // Log the request body to verify data
    console.log("Request body:", req.body);

    if (!email || !username || !password) {
      console.log('about to throw an error')
      return res.status(400).json("Missing required fields");

    }
    console.log('before query')
    // create a user and check if the user already exist in the database.
    const users = `SELECT * FROM users WHERE email = ?`;

    db.query(users, [email], (err, data) => {
      if (err) return res.status(500).json("something went wrong");
      console.log(data);
      if (data.length > 0)
        return res.status(409).json("user already exist in the database");
      // hash the password before storing it
      const hashedPassword = bcrypt.hashSync(password, 10);

      const newUser = `INSERT INTO users(email,username,password)VALUES(?,?,?)`;

      values = [email, username, hashedPassword];
      // insert the new user in the database
      db.query(newUser, values, (err, data) => {
        if (err) {
          return res.status(500).json("something went wrong");
        }
        return res.status(200).json("user created sucessfully");
      });
    });
  } catch (error) {
    res.status(500).json("Internal server error");
  }
});

//users login route
app.post('/api/login',async(req,res)=>{
  try {
    const users = `SELECT * FROM users WHERE email = ?`
    db.query(users,[req.body.email],(err,data)=>{
if(data.lenth === 0) return res.status(404).json('user not found')
  //check if password is valid 
const isPasswordValid = bcrypt.compareSync(req.body.password,data[0].password);
if(!isPasswordValid) return res.status(400).json('invaid email or password');
return res.status(200).json('login sucessfull')
    })
  } catch (error) {

    
  }
})

//expenses route
app.post('/api/expenses', (req, res) => {
  const { type, name, amount, date } = req.body;
  console.log("Request body:", req.body);

  if (!type || !name || !amount || !date) {
    console.log('about to throw an error');
    return res.status(400).json('Missing required fields');
  }

  const newExpense = `INSERT INTO expenses (type, name, amount, date) VALUES (?, ?, ?, ?)`;

  const values = [type, name, amount, date];

  db.query(newExpense, values, (err, result) => {
    if (err) return res.status(500).json('Failed to add expense');
    
    return res.status(200).json('Expense added successfully');
  });
});

//logic to fetch expense data from the database 
app.get('/api/transactions',(req,res)=>{
  const query = `SELECT * FROM expenses`

  db.query(query, (err, data) => {
    if (err) return res.status(500).json("Something went wrong");
    res.status(200).json(data);
  });
})

app.listen(port, () => {
  console.log(`App is runing on port ${port}`);
});
