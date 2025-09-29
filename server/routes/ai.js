const express = require('express');
const { aiGenerate } = require('../utils/ai');

const router = express.Router();

router.post('/analyze-resume', async function(req, res) {
  try {
    const { resumeText, role } = req.body;

    if (!resumeText) {
      return res.status(400).json({ error: 'Resume text is required' });
    }

    const prompt = `Analyze this resume for a ${role || 'general'} position and provide:
1. Key skills identified
2. Years of experience
3. Education background
4. Strengths
5. Areas for improvement

Resume:
${resumeText}

Provide a detailed analysis in JSON format with these fields: skills, experience, education, strengths, improvements`;

    const analysis = await aiGenerate(prompt);
    res.json({ analysis: analysis });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze resume' });
  }
});

router.post('/generate-questions', async function(req, res) {
  try {
    const { resumeText, role, difficulty } = req.body;

    if (!resumeText || !role) {
      return res.status(400).json({ error: 'Resume text and role are required' });
    }

    const prompt = `Based on this resume and the ${role} position, generate ${difficulty || 'medium'} difficulty interview questions.

Resume:
${resumeText}

Generate 5 relevant technical and behavioral questions in JSON array format with fields: question, category, expectedAnswer`;

    const questions = await aiGenerate(prompt);
    res.json({ questions: questions });
  } catch (error) {
    console.error('Question generation error:', error);
    res.status(500).json({ error: 'Failed to generate questions' });
  }
});

module.exports = router;