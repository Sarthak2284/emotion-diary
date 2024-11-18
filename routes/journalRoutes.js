const express = require('express');
const Journal = require('../models/Journal');
const router = express.Router();

// Middleware to ensure the user is logged in
function isAuthenticated(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  next();
}

// View all journal entries for the logged-in user (Dashboard)
router.get('/dashboard', isAuthenticated, async (req, res) => {
  try {
    // Fetch the journals for the logged-in user
    const journals = await Journal.find({ user: req.session.user._id }).sort({ dateCreated: -1 });

    // Pass journals and user data to the dashboard view
    res.render('pages/dashboard', { user: req.session.user, journals: journals });
  } catch (err) {
    console.error(err);
    res.redirect('/?error=Something+Went+Wrong');
  }
});

// View all journal entries for the logged-in user
router.get('/journal', isAuthenticated, async (req, res) => {
  try {
    const journals = await Journal.find({ user: req.session.user._id }).sort({ dateCreated: -1 });
    res.render('pages/journal', { journals });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// Create a new journal entry
router.get('/journal/new', isAuthenticated, (req, res) => {
  res.render('pages/create-journal', { query: req.query });
});

router.post('/journal', isAuthenticated, async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.redirect('/journal/new?error=All+fields+are+required');
  }

  try {
    const newJournal = new Journal({
      title,
      content,
      user: req.session.user._id
    });
    await newJournal.save();
    res.redirect('/journal');
  } catch (err) {
    console.error(err);
    res.redirect('/journal/new?error=Something+went+wrong');
  }
});

// Edit Journal 

router.get('/journal/edit/:id', isAuthenticated, async (req, res) => {
  try {
    const journal = await Journal.findById(req.params.id);

    if (!journal || journal.user.toString() !== req.session.user._id.toString()) {
      return res.redirect('/dashboard?error=Unauthorized');
    }

    res.render('pages/edit-journal', { journal });
  } catch (err) {
    console.error(err);
    res.redirect('/dashboard?error=Something+went+wrong');
  }
});

// Handle Edit Journal Submission
router.post('/journal/edit/:id', isAuthenticated, async (req, res) => {
  const { title, content } = req.body;

  try {
    const journal = await Journal.findById(req.params.id);

    if (!journal || journal.user.toString() !== req.session.user._id.toString()) {
      return res.redirect('/dashboard?error=Unauthorized');
    }

    journal.title = title || journal.title;
    journal.content = content || journal.content;
    await journal.save();

    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.redirect('/dashboard?error=Something+went+wrong');
  }
});

// Delete a journal entry
router.post('/journal/delete/:id', isAuthenticated, async (req, res) => {
  try {
    const journal = await Journal.findById(req.params.id);

    // Check if the journal exists and belongs to the logged-in user
    if (!journal || journal.user.toString() !== req.session.user._id.toString()) {
      return res.redirect('/journal?error=Unauthorized');
    }

    // Use deleteOne() instead of remove()
    await Journal.deleteOne({ _id: req.params.id });

    res.redirect('/journal');
  } catch (err) {
    console.error(err);
    res.redirect('/journal?error=Something+went+wrong');
  }
});

// View specific journal content
router.get('/journal/view/:id', isAuthenticated, async (req, res) => {
  try {
    const journal = await Journal.findById(req.params.id);

    // Check if journal exists and belongs to the logged-in user
    if (!journal || journal.user.toString() !== req.session.user._id.toString()) {
      return res.redirect('/dashboard?error=Unauthorized');
    }

    // Render a view page with the journal content
    res.render('pages/view-journal', { journal });
  } catch (err) {
    console.error(err);
    res.redirect('/dashboard?error=Something+went+wrong');
  }
});

module.exports = router;
