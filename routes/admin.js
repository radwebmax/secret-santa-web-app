const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Selection = require('../models/Selection');
const Pairing = require('../models/Pairing');

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  
  const user = await User.findById(req.session.userId);
  if (!user || !user.isAdmin) {
    return res.redirect('/dashboard');
  }
  
  next();
};

// Admin dashboard
router.get('/', requireAdmin, async (req, res) => {
  try {
    const selection = await Selection.findOne();
    const users = await User.find({}).select('username userId wish excludedUsers _id');
    const pairings = await Pairing.find({}).populate('santa recipient', 'username userId wish');
    
    res.render('admin', {
      selection,
      users,
      pairings,
      error: null,
      success: null,
      session: req.session
    });
  } catch (error) {
    res.render('admin', {
      selection: null,
      users: [],
      pairings: [],
      error: 'An error occurred',
      success: null,
      session: req.session
    });
  }
});

// Start selection
router.post('/start-selection', requireAdmin, async (req, res) => {
  try {
    // Check if selection already active
    let selection = await Selection.findOne();
    if (selection && selection.isActive) {
      return res.json({ success: false, message: 'Selection is already active' });
    }
    
    // Get all users
    const users = await User.find({});
    
    if (users.length < 2) {
      return res.json({ success: false, message: 'Need at least 2 users to start selection' });
    }
    
    // Clear previous pairings
    await Pairing.deleteMany({});
    
    // Reset all user assignments
    await User.updateMany({}, { $set: { assignedTo: null, assignedBy: null } });
    
    // Perform secret santa selection with exclusions
    const result = performSecretSantaSelection(users);
    
    if (!result.success) {
      return res.json({ success: false, message: result.message });
    }
    
    // Save pairings
    for (const pairing of result.pairings) {
      const newPairing = new Pairing({
        santa: pairing.santa,
        recipient: pairing.recipient
      });
      await newPairing.save();
      
      // Update user assignments
      await User.findByIdAndUpdate(pairing.santa, { assignedTo: pairing.recipient });
      await User.findByIdAndUpdate(pairing.recipient, { assignedBy: pairing.santa });
    }
    
    // Activate selection
    if (!selection) {
      selection = new Selection();
    }
    selection.isActive = true;
    selection.startedAt = new Date();
    selection.startedBy = req.session.userId;
    await selection.save();
    
    res.json({ success: true, message: 'Secret Santa selection completed successfully!' });
  } catch (error) {
    console.error('Selection error:', error);
    res.json({ success: false, message: 'An error occurred during selection' });
  }
});

// Reset selection
router.post('/reset-selection', requireAdmin, async (req, res) => {
  try {
    const selection = await Selection.findOne();
    if (selection) {
      selection.isActive = false;
      selection.startedAt = null;
      selection.startedBy = null;
      await selection.save();
    }
    
    await Pairing.deleteMany({});
    await User.updateMany({}, { $set: { assignedTo: null, assignedBy: null } });
    
    res.json({ success: true, message: 'Selection reset successfully' });
  } catch (error) {
    res.json({ success: false, message: 'An error occurred' });
  }
});

// Delete selection completely
router.post('/delete-selection', requireAdmin, async (req, res) => {
  try {
    await Selection.deleteMany({});
    await Pairing.deleteMany({});
    await User.updateMany({}, { $set: { assignedTo: null, assignedBy: null } });
    
    res.json({ success: true, message: 'Selection deleted completely' });
  } catch (error) {
    console.error('Delete selection error:', error);
    res.json({ success: false, message: 'An error occurred' });
  }
});

// Secret Santa selection algorithm with exclusions
function performSecretSantaSelection(users) {
  if (users.length < 2) {
    return { success: false, message: 'Need at least 2 users' };
  }
  
  const pairings = [];
  const availableRecipients = [...users];
  const usedRecipients = new Set();
  
  // Try multiple times if needed
  for (let attempt = 0; attempt < 100; attempt++) {
    pairings.length = 0;
    usedRecipients.clear();
    availableRecipients.length = users.length;
    for (let i = 0; i < availableRecipients.length; i++) {
      availableRecipients[i] = users[i];
    }
    
    let allAssigned = true;
    
    for (const santa of users) {
      // Filter out excluded users and already assigned recipients
      const excludedIds = santa.excludedUsers || [];
      const possibleRecipients = availableRecipients.filter(recipient => {
        return recipient._id.toString() !== santa._id.toString() &&
               !excludedIds.includes(recipient.userId) &&
               !usedRecipients.has(recipient._id.toString());
      });
      
      if (possibleRecipients.length === 0) {
        allAssigned = false;
        break;
      }
      
      // Randomly select a recipient
      const randomIndex = Math.floor(Math.random() * possibleRecipients.length);
      const selectedRecipient = possibleRecipients[randomIndex];
      
      pairings.push({
        santa: santa._id,
        recipient: selectedRecipient._id
      });
      
      usedRecipients.add(selectedRecipient._id.toString());
    }
    
    if (allAssigned) {
      return { success: true, pairings };
    }
  }
  
  return { success: false, message: 'Could not create valid pairings with current exclusions. Please adjust exclusions.' };
}

// Delete user
router.delete('/user/:userId', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.session.userId;
    
    // Prevent admin from deleting themselves
    if (userId === currentUserId) {
      return res.json({ success: false, message: 'You cannot delete your own account' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }
    
    // Check if selection is active - if so, prevent deletion
    const selection = await Selection.findOne();
    if (selection && selection.isActive) {
      return res.json({ success: false, message: 'Cannot delete users while selection is active. Reset selection first.' });
    }
    
    // Delete user's pairings if any
    await Pairing.deleteMany({
      $or: [
        { santa: userId },
        { recipient: userId }
      ]
    });
    
    // Remove user from other users' exclusions
    await User.updateMany(
      { excludedUsers: user.userId },
      { $pull: { excludedUsers: user.userId } }
    );
    
    // Clear assignments if this user was assigned to someone or someone was assigned to them
    await User.updateMany(
      { $or: [{ assignedTo: userId }, { assignedBy: userId }] },
      { $set: { assignedTo: null, assignedBy: null } }
    );
    
    // Delete the user
    await User.findByIdAndDelete(userId);
    
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.json({ success: false, message: 'An error occurred while deleting the user' });
  }
});

module.exports = router;

