const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Journal = require('../models/Journal'); // To fetch user journals
const router = express.Router();

// Middleware to ensure the user is logged in
function isAuthenticated(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/auth/login?error=Please+login+to+access+this+page');
  }
  next();
}

router.get('/', (req, res) => {
    res.render('pages/home');
  });

// Registration Page
router.get('/register', (req, res) => {
  res.render('pages/register', { query: req.query });
});

// Handle Registration
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.redirect('/auth/register?error=Missing+Fields');
  }

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.redirect('/auth/register?error=User+Already+Exists');
    }

    const newUser = new User({ username, email, password });
    await newUser.save();
    res.redirect('/auth/login?success=Account+Created');
  } catch (err) {
    console.error(err);
    res.redirect('/auth/register?error=Something+Went+Wrong');
  }
});

// Login Page
router.get('/login', (req, res) => {
  res.render('pages/login', { query: req.query });
});

// Handle Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.redirect('/auth/login?error=Missing+Fields');
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.redirect('/auth/login?error=Invalid+Credentials');
    }

    const isMatch = await user.isValidPassword(password);
    if (!isMatch) {
      return res.redirect('/auth/login?error=Invalid+Credentials');
    }

    req.session.user = user; // Save user session
    res.redirect('/auth/dashboard'); // Redirect to dashboard
  } catch (err) {
    console.error(err);
    res.redirect('/auth/login?error=Something+Went+Wrong');
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect('/auth/dashboard?error=Logout+Failed');
    }
    res.redirect('/');
  });
});

// Dashboard Route
router.get('/dashboard', isAuthenticated, async (req, res) => {
  try {
    const journals = await Journal.find({ user: req.session.user._id }).sort({ dateCreated: -1 });
    res.render('pages/dashboard', { user: req.session.user, journals });
  } catch (err) {
    console.error(err);
    res.redirect('/auth/login?error=Something+Went+Wrong');
  }
});

module.exports = router;
