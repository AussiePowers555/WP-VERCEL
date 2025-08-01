const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { DatabaseService } = require('../lib/database');
const router = express.Router();

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const user = await DatabaseService.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const tokenExpiry = rememberMe ? '30d' : '24h';
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: tokenExpiry }
    );

    // Update last login
    await DatabaseService.query(
      'UPDATE user_accounts SET last_login = $1 WHERE id = $2',
      [new Date().toISOString(), user.id]
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        first_login: user.first_login
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change password endpoint
router.post('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword, token } = req.body;

    if (!currentPassword || !newPassword || !token) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    const user = await DatabaseService.getUserByEmail(decoded.email);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await DatabaseService.query(
      'UPDATE user_accounts SET password_hash = $1, first_login = false, updated_at = $2 WHERE id = $3',
      [newPasswordHash, new Date().toISOString(), user.id]
    );

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Set password endpoint (for first-time users)
router.post('/set-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and new password are required' });
    }

    const user = await DatabaseService.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.first_login) {
      return res.status(400).json({ error: 'Password has already been set' });
    }

    // Hash new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password and mark first_login as false
    await DatabaseService.query(
      'UPDATE user_accounts SET password_hash = $1, first_login = false, updated_at = $2 WHERE id = $3',
      [passwordHash, new Date().toISOString(), user.id]
    );

    res.json({ message: 'Password set successfully' });
  } catch (error) {
    console.error('Set password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;