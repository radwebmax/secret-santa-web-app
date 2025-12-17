const mongoose = require('mongoose');

const selectionSchema = new mongoose.Schema({
  isActive: {
    type: Boolean,
    default: false
  },
  startedAt: {
    type: Date,
    default: null
  },
  startedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
});

module.exports = mongoose.model('Selection', selectionSchema);

