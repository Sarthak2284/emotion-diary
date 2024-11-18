const express = require('express');
const isAuthenticated = require('../middleware/auth');
const router = express.Router();

// Dashboard (Protected)
router.get('/dashboard', isAuthenticated, (req, res) => {
    res.render('pages/dashboard', { user: req.session.user });
});

module.exports = router;
