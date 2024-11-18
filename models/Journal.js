const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dateCreated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Journal', journalSchema);
