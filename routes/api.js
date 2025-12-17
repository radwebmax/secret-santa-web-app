const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get user info by userId
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ userId }).select('username userId');
    
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    res.json({ success: false, message: 'An error occurred' });
  }
});

module.exports = router;

