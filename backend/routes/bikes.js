const express = require('express');
const { DatabaseService } = require('../lib/database');
const router = express.Router();

// Get all bikes
router.get('/', async (req, res) => {
  try {
    const bikes = await DatabaseService.getAllBikes();
    res.json(bikes);
  } catch (error) {
    console.error('Error fetching bikes:', error);
    res.status(500).json({ error: 'Failed to fetch bikes' });
  }
});

// Get bike by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const bike = await DatabaseService.getBikeById(id);
    
    if (!bike) {
      return res.status(404).json({ error: 'Bike not found' });
    }
    
    res.json(bike);
  } catch (error) {
    console.error('Error fetching bike:', error);
    res.status(500).json({ error: 'Failed to fetch bike' });
  }
});

// Create new bike
router.post('/', async (req, res) => {
  try {
    const bikeData = req.body;
    
    // Validate required fields
    if (!bikeData.make) {
      return res.status(400).json({ error: 'Bike make is required' });
    }
    
    if (!bikeData.model) {
      return res.status(400).json({ error: 'Bike model is required' });
    }
    
    const newBike = await DatabaseService.createBike(bikeData);
    res.status(201).json(newBike);
  } catch (error) {
    console.error('Error creating bike:', error);
    res.status(500).json({ error: 'Failed to create bike' });
  }
});

// Update bike
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const existingBike = await DatabaseService.getBikeById(id);
    if (!existingBike) {
      return res.status(404).json({ error: 'Bike not found' });
    }
    
    const updatedBike = await DatabaseService.updateBike(id, updates);
    res.json(updatedBike);
  } catch (error) {
    console.error('Error updating bike:', error);
    res.status(500).json({ error: 'Failed to update bike' });
  }
});

// Delete bike
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingBike = await DatabaseService.getBikeById(id);
    if (!existingBike) {
      return res.status(404).json({ error: 'Bike not found' });
    }
    
    const result = await DatabaseService.query('DELETE FROM bikes WHERE id = $1', [id]);
    
    if (result.rowCount > 0) {
      res.json({ message: 'Bike deleted successfully' });
    } else {
      res.status(500).json({ error: 'Failed to delete bike' });
    }
  } catch (error) {
    console.error('Error deleting bike:', error);
    res.status(500).json({ error: 'Failed to delete bike' });
  }
});

module.exports = router;