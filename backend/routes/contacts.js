const express = require('express');
const { DatabaseService } = require('../lib/database');
const router = express.Router();

// Get all contacts
router.get('/', async (req, res) => {
  try {
    const contacts = await DatabaseService.getAllContacts();
    res.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// Create new contact
router.post('/', async (req, res) => {
  try {
    const contactData = req.body;
    
    // Validate required fields
    if (!contactData.name) {
      return res.status(400).json({ error: 'Contact name is required' });
    }
    
    if (!contactData.type) {
      return res.status(400).json({ error: 'Contact type is required' });
    }
    
    const newContact = await DatabaseService.createContact(contactData);
    res.status(201).json(newContact);
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ error: 'Failed to create contact' });
  }
});

module.exports = router;