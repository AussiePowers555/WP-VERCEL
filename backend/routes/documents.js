const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { DatabaseService } = require('../lib/database');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow PDF, DOC, DOCX, JPG, PNG files
    const allowedTypes = /pdf|doc|docx|jpg|jpeg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Get documents for a case
router.get('/:caseId', async (req, res) => {
  try {
    const { caseId } = req.params;
    
    const result = await DatabaseService.query(
      'SELECT * FROM signed_documents WHERE case_id = $1 ORDER BY signed_at DESC',
      [caseId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Get specific document
router.get('/:caseId/:documentId', async (req, res) => {
  try {
    const { caseId, documentId } = req.params;
    
    const result = await DatabaseService.query(
      'SELECT * FROM signed_documents WHERE case_id = $1 AND id = $2',
      [caseId, documentId]
    );
    
    const document = result.rows[0];
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    res.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// Upload signed document
router.post('/upload-signed', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const { caseId, documentType, signedBy, signatureData, ipAddress, userAgent } = req.body;
    
    if (!caseId || !documentType || !signedBy || !signatureData) {
      return res.status(400).json({ 
        error: 'Case ID, document type, signed by and signature data are required' 
      });
    }
    
    // Generate file hash
    const fileBuffer = require('fs').readFileSync(req.file.path);
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    
    // Create document record
    const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    await DatabaseService.query(`
      INSERT INTO signed_documents (
        id, case_id, document_type, file_name, file_path, file_size,
        sha256_hash, signed_at, signed_by, signature_data, ip_address,
        user_agent, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    `, [
      documentId, caseId, documentType, req.file.originalname, req.file.path,
      req.file.size, hash, now, signedBy, signatureData, ipAddress || '',
      userAgent || '', now, now
    ]);
    
    res.json({
      message: 'Document uploaded successfully',
      documentId: documentId,
      fileName: req.file.originalname,
      fileSize: req.file.size
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// Send document for signature
router.post('/send-for-signature', async (req, res) => {
  try {
    const { caseId, clientEmail, documentType, formData } = req.body;
    
    if (!caseId || !clientEmail || !documentType) {
      return res.status(400).json({ 
        error: 'Case ID, client email and document type are required' 
      });
    }
    
    // Generate signature token
    const token = `sig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry
    
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
      message: 'Document sent for signature successfully',
      token: token,
      signatureUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/sign-agreement?token=${token}`,
      expiresAt: expiresAt.toISOString()
    });
  } catch (error) {
    console.error('Error sending document for signature:', error);
    res.status(500).json({ error: 'Failed to send document for signature' });
  }
});

module.exports = router;