const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const db = require('../db');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

router.post('/upload', upload.single('resume'), async function(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    let extractedText = '';

    if (req.file.mimetype === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      extractedText = pdfData.text;
    } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ path: filePath });
      extractedText = result.value;
    } else {
      return res.status(400).json({ error: 'Unsupported file format' });
    }

    const candidateId = Date.now().toString();
    const candidate = {
      id: candidateId,
      file: req.file.filename,
      status: 'uploaded',
      extractedText: extractedText
    };

    db.get('candidates').push(candidate).write();

    res.json({ 
      message: 'Resume uploaded successfully', 
      candidateId: candidateId,
      extractedText: extractedText 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to process resume' });
  }
});

router.patch('/candidates/:id', function(req, res) {
  try {
    const { name, email, phone } = req.body;
    const candidate = db.get('candidates').find({ id: req.params.id }).value();
    
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (phone) updates.phone = phone;

    db.get('candidates').find({ id: req.params.id }).assign(updates).write();

    res.json({ message: 'Candidate updated', candidate: { ...candidate, ...updates } });
  } catch (error) {
    console.error('Error updating candidate:', error);
    res.status(500).json({ error: 'Failed to update candidate' });
  }
});

router.get('/candidates', function(req, res) {
  try {
    const candidates = db.get('candidates').value();
    res.json(candidates);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

router.get('/candidates/:id', function(req, res) {
  try {
    const candidate = db.get('candidates').find({ id: req.params.id }).value();
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    res.json(candidate);
  } catch (error) {
    console.error('Error fetching candidate:', error);
    res.status(500).json({ error: 'Failed to fetch candidate' });
  }
});

module.exports = router;