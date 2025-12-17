const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Selection = require('../models/Selection');

// Middleware to check if user is logged in
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
};

// Dashboard page
router.get('/', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    const selection = await Selection.findOne();
    const isSelectionActive = selection && selection.isActive;
    
    let assignedUser = null;
    if (isSelectionActive && user.assignedTo) {
      assignedUser = await User.findById(user.assignedTo);
    }
    
    res.render('dashboard', {
      user,
      isSelectionActive,
      assignedUser,
      error: null,
      success: null
    });
  } catch (error) {
    res.render('dashboard', {
      user: null,
      isSelectionActive: false,
      assignedUser: null,
      error: 'An error occurred',
      success: null
    });
  }
});

// Update wish
router.post('/wish', requireAuth, async (req, res) => {
  try {
    const { wish } = req.body;
    const user = await User.findById(req.session.userId);
    
    const selection = await Selection.findOne();
    if (selection && selection.isActive) {
      return res.json({ success: false, message: 'Selection has already started. Cannot modify wish.' });
    }
    
    user.wish = wish || '';
    await user.save();
    
    res.json({ success: true, message: 'Wish updated successfully' });
  } catch (error) {
    res.json({ success: false, message: 'An error occurred' });
  }
});

// Add exclusion
router.post('/exclude', requireAuth, async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(req.session.userId);
    
    const selection = await Selection.findOne();
    if (selection && selection.isActive) {
      return res.json({ success: false, message: 'Selection has already started. Cannot modify exclusions.' });
    }
    
    // Find user by userId
    const excludedUser = await User.findOne({ userId });
    if (!excludedUser) {
      return res.json({ success: false, message: 'User ID not found' });
    }
    
    if (excludedUser._id.toString() === user._id.toString()) {
      return res.json({ success: false, message: 'Cannot exclude yourself' });
    }
    
    // Check if already excluded
    if (user.excludedUsers.includes(excludedUser.userId)) {
      return res.json({ success: false, message: 'User already excluded' });
    }
    
    user.excludedUsers.push(excludedUser.userId);
    await user.save();
    
    res.json({ success: true, message: 'User excluded successfully' });
  } catch (error) {
    res.json({ success: false, message: 'An error occurred' });
  }
});

// Remove exclusion
router.post('/remove-exclusion', requireAuth, async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(req.session.userId);
    
    const selection = await Selection.findOne();
    if (selection && selection.isActive) {
      return res.json({ success: false, message: 'Selection has already started. Cannot modify exclusions.' });
    }
    
    user.excludedUsers = user.excludedUsers.filter(id => id !== userId);
    await user.save();
    
    res.json({ success: true, message: 'Exclusion removed successfully' });
  } catch (error) {
    res.json({ success: false, message: 'An error occurred' });
  }
});

module.exports = router;

