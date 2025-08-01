const express = require('express');
const { DatabaseService } = require('../lib/database');
const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await DatabaseService.getAllUserAccounts();
    
    // Remove password hashes from response
    const safeUsers = users.map(user => {
      const { password_hash, ...safeUser } = user;
      return safeUser;
    });
    
    res.json(safeUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;