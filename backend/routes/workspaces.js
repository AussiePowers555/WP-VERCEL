const express = require('express');
const { DatabaseService } = require('../lib/database');
const router = express.Router();

// Get all workspaces
router.get('/', async (req, res) => {
  try {
    const workspaces = await DatabaseService.getAllWorkspaces();
    res.json(workspaces);
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    res.status(500).json({ error: 'Failed to fetch workspaces' });
  }
});

// Get workspace by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await DatabaseService.query('SELECT * FROM workspaces WHERE id = $1', [id]);
    const workspace = result.rows[0];
    
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }
    
    res.json(workspace);
  } catch (error) {
    console.error('Error fetching workspace:', error);
    res.status(500).json({ error: 'Failed to fetch workspace' });
  }
});

// Create new workspace
router.post('/', async (req, res) => {
  try {
    const workspaceData = req.body;
    
    // Validate required fields
    if (!workspaceData.name) {
      return res.status(400).json({ error: 'Workspace name is required' });
    }
    
    if (!workspaceData.contact_id) {
      return res.status(400).json({ error: 'Contact ID is required' });
    }
    
    const newWorkspace = await DatabaseService.createWorkspace(workspaceData);
    res.status(201).json(newWorkspace);
  } catch (error) {
    console.error('Error creating workspace:', error);
    res.status(500).json({ error: 'Failed to create workspace' });
  }
});

// Update workspace
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Check if workspace exists
    const existingResult = await DatabaseService.query('SELECT * FROM workspaces WHERE id = $1', [id]);
    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Workspace not found' });
    }
    
    // Update workspace
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    
    const result = await DatabaseService.query(`
      UPDATE workspaces 
      SET ${setClause}, updated_at = $${fields.length + 1}
      WHERE id = $${fields.length + 2}
      RETURNING *
    `, [...values, new Date().toISOString(), id]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating workspace:', error);
    res.status(500).json({ error: 'Failed to update workspace' });
  }
});

// Delete workspace
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await DatabaseService.query('DELETE FROM workspaces WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Workspace not found' });
    }
    
    res.json({ message: 'Workspace deleted successfully' });
  } catch (error) {
    console.error('Error deleting workspace:', error);
    res.status(500).json({ error: 'Failed to delete workspace' });
  }
});

module.exports = router;