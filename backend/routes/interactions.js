const express = require('express');
const { DatabaseService } = require('../lib/database');
const router = express.Router();

// Get all interactions
router.get('/', async (req, res) => {
  try {
    const result = await DatabaseService.query(`
      SELECT * FROM case_interactions 
      ORDER BY timestamp DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching interactions:', error);
    res.status(500).json({ error: 'Failed to fetch interactions' });
  }
});

// Create new interaction
router.post('/', async (req, res) => {
  try {
    const interactionData = req.body;
    
    // Validate required fields
    if (!interactionData.caseNumber) {
      return res.status(400).json({ error: 'Case number is required' });
    }
    
    if (!interactionData.source) {
      return res.status(400).json({ error: 'Source is required' });
    }
    
    if (!interactionData.method) {
      return res.status(400).json({ error: 'Method is required' });
    }
    
    if (!interactionData.situation) {
      return res.status(400).json({ error: 'Situation is required' });
    }
    
    if (!interactionData.action) {
      return res.status(400).json({ error: 'Action is required' });
    }
    
    if (!interactionData.outcome) {
      return res.status(400).json({ error: 'Outcome is required' });
    }
    
    interactionData.timestamp = interactionData.timestamp || new Date().toISOString();
    
    const newInteraction = await DatabaseService.createCaseInteraction(interactionData);
    res.status(201).json(newInteraction);
  } catch (error) {
    console.error('Error creating interaction:', error);
    res.status(500).json({ error: 'Failed to create interaction' });
  }
});

module.exports = router;