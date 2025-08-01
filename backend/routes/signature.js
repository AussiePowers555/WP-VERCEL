const express = require('express');
const { DatabaseService } = require('../lib/database');
const router = express.Router();

// Submit signature
router.post('/submit', async (req, res) => {
  try {
    const { token, signatureData, signerName, ipAddress, userAgent } = req.body;
    
    if (!token || !signatureData || !signerName) {
      return res.status(400).json({ error: 'Token, signature data and signer name are required' });
    }
    
    // Find the signature token
    const tokenResult = await DatabaseService.query(
      'SELECT * FROM signature_tokens WHERE token = $1',
      [token]
    );
    
    const signatureToken = tokenResult.rows[0];
    if (!signatureToken) {
      return res.status(404).json({ error: 'Invalid signature token' });
    }
    
    // Check if token has expired
    if (new Date() > new Date(signatureToken.expires_at)) {
      return res.status(400).json({ error: 'Signature token has expired' });
    }
    
    // Check if already signed
    if (signatureToken.status === 'completed') {
      return res.status(400).json({ error: 'Document has already been signed' });
    }
    
    const now = new Date().toISOString();
    
    // Create digital signature record
    const signatureId = `sig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await DatabaseService.query(`
      INSERT INTO digital_signatures (
        id, case_id, signature_token_id, signature_data, signer_name, 
        terms_accepted, signed_at, ip_address, user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      signatureId, signatureToken.case_id, signatureToken.id, signatureData, 
      signerName, true, now, ipAddress, userAgent
    ]);
    
    // Update signature token status
    await DatabaseService.query(`
      UPDATE signature_tokens 
      SET status = 'completed', signed_at = $1, completed_at = $2, updated_at = $3
      WHERE id = $4
    `, [now, now, now, signatureToken.id]);
    
    res.json({ 
      message: 'Signature submitted successfully',
      signatureId: signatureId
    });
  } catch (error) {
    console.error('Error submitting signature:', error);
    res.status(500).json({ error: 'Failed to submit signature' });
  }
});

// Validate signature token
router.post('/validate-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }
    
    const result = await DatabaseService.query(
      'SELECT * FROM signature_tokens WHERE token = $1',
      [token]
    );
    
    const signatureToken = result.rows[0];
    if (!signatureToken) {
      return res.status(404).json({ error: 'Invalid signature token' });
    }
    
    // Check if token has expired
    if (new Date() > new Date(signatureToken.expires_at)) {
      return res.status(400).json({ 
        error: 'Signature token has expired',
        expired: true 
      });
    }
    
    // Check if already completed
    if (signatureToken.status === 'completed') {
      return res.status(400).json({ 
        error: 'Document has already been signed',
        completed: true 
      });
    }
    
    res.json({
      valid: true,
      token: signatureToken,
      caseId: signatureToken.case_id,
      documentType: signatureToken.document_type
    });
  } catch (error) {
    console.error('Error validating token:', error);
    res.status(500).json({ error: 'Failed to validate token' });
  }
});

// Create signature document
router.post('/create-document', async (req, res) => {
  try {
    const { caseId, clientEmail, documentType, formData } = req.body;
    
    if (!caseId || !clientEmail || !documentType) {
      return res.status(400).json({ error: 'Case ID, client email and document type are required' });
    }
    
    // Generate unique token
    const token = `sig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry
    
    // Create signature token
    const tokenId = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    await DatabaseService.query(`
      INSERT INTO signature_tokens (
        id, token, case_id, client_email, document_type, form_data,
        status, expires_at, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      tokenId, token, caseId, clientEmail, documentType, 
      JSON.stringify(formData || {}), 'pending', expiresAt.toISOString(), now, now
    ]);
    
    res.json({
      message: 'Signature document created successfully',
      token: token,
      expiresAt: expiresAt.toISOString()
    });
  } catch (error) {
    console.error('Error creating signature document:', error);
    res.status(500).json({ error: 'Failed to create signature document' });
  }
});

// Get rental details for a case
router.get('/rental-details/:caseId', async (req, res) => {
  try {
    const { caseId } = req.params;
    
    const caseResult = await DatabaseService.query(
      'SELECT * FROM cases WHERE id = $1',
      [caseId]
    );
    
    const caseData = caseResult.rows[0];
    if (!caseData) {
      return res.status(404).json({ error: 'Case not found' });
    }
    
    res.json({
      caseNumber: caseData.case_number,
      clientName: caseData.client_name,
      clientEmail: caseData.client_email,
      clientPhone: caseData.client_phone,
      rentalCompany: caseData.rental_company,
      status: caseData.status
    });
  } catch (error) {
    console.error('Error fetching rental details:', error);
    res.status(500).json({ error: 'Failed to fetch rental details' });
  }
});

module.exports = router;