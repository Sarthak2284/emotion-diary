const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const journalRoutes = require('./routes/journalRoutes');
const path = require('path');

const app = express();

// Middleware to parse request bodies and handle sessions
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'your-secret-key',  // Replace this with a secure key for production
  resave: false,
  saveUninitialized: true
}));

// Set the views directory and view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Use the authRoutes and journalRoutes in the application
app.use('/auth', authRoutes);  // Authentication-related routes (login, register, logout)
app.use('/', journalRoutes);   // Journal-related routes (view, create, delete journals)

app.get('/', (req,res) =>{
    res.render('pages/home' , {query: req.query});  // Render the home page when the root URL is accessed
})
// Serve static files (e.g., styles, images) from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect('mongodb://localhost/emotion-diary', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Database connected'))
  .catch((err) => console.log('Database connection error:', err));

// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
