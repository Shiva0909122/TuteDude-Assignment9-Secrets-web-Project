const express = require('express');
const bodyParser = require('body-parser');
const encrypt = require('mongoose-encryption');
const mongoose = require("mongoose");

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/secrets", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Define schema and model
const trySchema = new mongoose.Schema({
    email: String,
    password: String
});

const secret = 'thisislittlesecret.';
trySchema.plugin(encrypt, { secret: secret, encryptedFields: ["password"] });

const Item = mongoose.model("Item", trySchema);

// Routes
app.get('/', (req, res) => {
    res.render('home');  // Renders 'home.ejs' template
});

app.get('/register', (req, res) => {
    res.render('register'); // Renders 'register.ejs' template
});

app.get('/login', (req, res) => {
    res.render('login'); // Renders 'login.ejs' template
});

// GET route to render the submit form
app.get('/submit', (req, res) => {
    res.render('submit');  // Renders 'submit.ejs' template
});

// POST route to handle form submission
app.post('/submit', (req, res) => {
    const userSecret = req.body.secret;
    console.log("Secret submitted:", userSecret); // Logs the submitted secret

    // Optionally, save the secret to the database or perform any required action here

    res.render("secrets");  // Renders 'secrets.ejs' after submission
});

// Register route with async/await
app.post('/register', async (req, res) => {
    try {
        const newUser = new Item({
            email: req.body.username,
            password: req.body.password
        });
        await newUser.save();  // Save user without callback
        res.render("secrets");  // Render secrets page on success
    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).send("An error occurred during registration.");
    }
});
app.post('/submit', (req, res) => {
    console.log("Submit POST route accessed");  // Confirm route is accessed
    console.log("Secret received:", req.body.secret);  // Log the secret input

    res.render("secrets");  // Render the secrets page
});

// Login route
app.post("/login", async (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;
        
        const foundUser = await Item.findOne({ email: username });
        if (foundUser && foundUser.password === password) {
            res.render("secrets");  // Render secrets page on successful login
        } else {
            res.status(401).send("Invalid username or password");
        }
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).send("An error occurred during login.");
    }
});

// Start the server on port 5001
app.listen(5002, () => {
    console.log("Server started on port 5002");
});
