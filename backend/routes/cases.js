const express = require('express');
const { DatabaseService } = require('../lib/database');
const router = express.Router();

// Get all cases
router.get('/', async (req, res) => {
  try {
    const cases = await DatabaseService.getAllCases();
    res.json(cases);
  } catch (error) {
    console.error('Error fetching cases:', error);
    res.status(500).json({ error: 'Failed to fetch cases' });
  }
});

// Get case by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const caseData = await DatabaseService.getCaseById(id);
    
    if (!caseData) {
      return res.status(404).json({ error: 'Case not found' });
    }
    
    res.json(caseData);
  } catch (error) {
    console.error('Error fetching case:', error);
    res.status(500).json({ error: 'Failed to fetch case' });
  }
});

// Get case by case number
router.get('/by-number/:caseNumber', async (req, res) => {
  try {
    const { caseNumber } = req.params;
    const caseData = await DatabaseService.getCaseByCaseNumber(caseNumber);
    
    if (!caseData) {
      return res.status(404).json({ error: 'Case not found' });
    }
    
    res.json(caseData);
  } catch (error) {
    console.error('Error fetching case by number:', error);
    res.status(500).json({ error: 'Failed to fetch case' });
  }
});

// Create new case
router.post('/', async (req, res) => {
  try {
    const caseData = req.body;
    
    // Validate required fields
    if (!caseData.case_number && !caseData.caseNumber) {
      return res.status(400).json({ error: 'Case number is required' });
    }
    
    if (!caseData.client_name && !caseData.clientName) {
      return res.status(400).json({ error: 'Client name is required' });
    }
    
    if (!caseData.at_fault_party_name && !caseData.atFaultPartyName) {
      return res.status(400).json({ error: 'At-fault party name is required' });
    }
    
    const newCase = await DatabaseService.createCase(caseData);
    res.status(201).json(newCase);
  } catch (error) {
    console.error('Error creating case:', error);
    if (error.code === '23505') { // PostgreSQL unique violation
      return res.status(409).json({ error: 'Case number already exists' });
    }
    res.status(500).json({ error: 'Failed to create case' });
  }
});

// Update case
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const existingCase = await DatabaseService.getCaseById(id);
    if (!existingCase) {
      return res.status(404).json({ error: 'Case not found' });
    }
    
    const updatedCase = await DatabaseService.updateCase(id, updates);
    res.json(updatedCase);
  } catch (error) {
    console.error('Error updating case:', error);
    res.status(500).json({ error: 'Failed to update case' });
  }
});

// Delete case
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingCase = await DatabaseService.getCaseById(id);
    if (!existingCase) {
      return res.status(404).json({ error: 'Case not found' });
    }
    
    const deleted = await DatabaseService.deleteCase(id);
    if (deleted) {
      res.json({ message: 'Case deleted successfully' });
    } else {
      res.status(500).json({ error: 'Failed to delete case' });
    }
  } catch (error) {
    console.error('Error deleting case:', error);
    res.status(500).json({ error: 'Failed to delete case' });
  }
});

// Get case interactions
router.get('/:id/interactions', async (req, res) => {
  try {
    const { id } = req.params;
    
    // First get the case to get the case number
    const caseData = await DatabaseService.getCaseById(id);
    if (!caseData) {
      return res.status(404).json({ error: 'Case not found' });
    }
    
    const interactions = await DatabaseService.getCaseInteractions(caseData.case_number);
    res.json(interactions);
  } catch (error) {
    console.error('Error fetching case interactions:', error);
    res.status(500).json({ error: 'Failed to fetch case interactions' });
  }
});

// Create case interaction
router.post('/:id/interactions', async (req, res) => {
  try {
    const { id } = req.params;
    const interactionData = req.body;
    
    // Get the case to validate it exists and get case number
    const caseData = await DatabaseService.getCaseById(id);
    if (!caseData) {
      return res.status(404).json({ error: 'Case not found' });
    }
    
    // Add case number to interaction data
    interactionData.caseNumber = caseData.case_number;
    interactionData.timestamp = interactionData.timestamp || new Date().toISOString();
    
    const newInteraction = await DatabaseService.createCaseInteraction(interactionData);
    res.status(201).json(newInteraction);
  } catch (error) {
    console.error('Error creating case interaction:', error);
    res.status(500).json({ error: 'Failed to create case interaction' });
  }
});

// Delete all cases (for testing/development)
router.delete('/delete-all', async (req, res) => {
  try {
    const result = await DatabaseService.query('DELETE FROM cases');
    res.json({ 
      message: 'All cases deleted successfully',
      deletedCount: result.rowCount 
    });
  } catch (error) {
    console.error('Error deleting all cases:', error);
    res.status(500).json({ error: 'Failed to delete all cases' });
  }
});

// Create mock cases (for testing/development)
router.post('/create-mock', async (req, res) => {
  try {
    const mockCases = [
      {
        case_number: `MOCK-${Date.now()}-1`,
        status: 'Active',
        client_name: 'Mock Client 1',
        client_email: 'mock1@example.com',
        client_phone: '555-0001',
        at_fault_party_name: 'Mock At-Fault 1',
        rental_company: 'Mock Rentals',
        lawyer: 'Mock Lawyers',
        invoiced: 1000,
        reserve: 900,
        agreed: 900,
        paid: 0
      },
      {
        case_number: `MOCK-${Date.now()}-2`,
        status: 'Invoiced',
        client_name: 'Mock Client 2',
        client_email: 'mock2@example.com', 
        client_phone: '555-0002',
        at_fault_party_name: 'Mock At-Fault 2',
        rental_company: 'Mock Rentals',
        lawyer: 'Mock Lawyers',
        invoiced: 2000,
        reserve: 1800,
        agreed: 1800,
        paid: 1800
      }
    ];
    
    const createdCases = [];
    for (const mockCase of mockCases) {
      const newCase = await DatabaseService.createCase(mockCase);
      createdCases.push(newCase);
    }
    
    res.status(201).json({
      message: 'Mock cases created successfully',
      cases: createdCases
    });
  } catch (error) {
    console.error('Error creating mock cases:', error);
    res.status(500).json({ error: 'Failed to create mock cases' });
  }
});

module.exports = router;