const express = require('express');
const db = require('../db');
const { aiGenerate } = require('../utils/ai');

const router = express.Router();

router.post('/start', async function(req, res) {
  try {
    const { candidateId, role } = req.body;

    if (!candidateId || !role) {
      return res.status(400).json({ error: 'Candidate ID and role are required' });
    }

    let candidate = db.get('candidates').find({ id: String(candidateId) }).value();
    if (!candidate) {
      candidate = {
        id: String(candidateId),
        extractedText: "Default candidate profile for testing"
      };
    }

    const sessionId = 'session-' + Date.now();
    
    const prompt = `Generate 6 interview questions for a ${role} position based on this resume:

${candidate.extractedText || 'No resume text available'}

Requirements:
- 2 easy questions (20 seconds each)
- 2 medium questions (60 seconds each)
- 2 hard questions (120 seconds each)

Return ONLY a valid JSON array with this exact structure:
[
  {"difficulty": "easy", "text": "question text", "timerSec": 20},
  ...
]`;

    let questionsText;
    try {
      questionsText = await aiGenerate(prompt);
    } catch (error) {
      console.error('AI generation failed, using fallback questions');
      questionsText = JSON.stringify([
        {"difficulty": "easy", "text": "Tell me about yourself and your background", "timerSec": 20},
        {"difficulty": "easy", "text": "What interests you about this role?", "timerSec": 20},
        {"difficulty": "medium", "text": "Describe a challenging project you worked on", "timerSec": 60},
        {"difficulty": "medium", "text": "How do you handle tight deadlines?", "timerSec": 60},
        {"difficulty": "hard", "text": "Explain a complex technical problem you solved", "timerSec": 120},
        {"difficulty": "hard", "text": "Where do you see yourself in 5 years?", "timerSec": 120}
      ]);
    }

    let questions;
    try {
      const cleanedText = questionsText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      questions = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      questions = [
        {"difficulty": "easy", "text": "Tell me about yourself and your background", "timerSec": 20},
        {"difficulty": "easy", "text": "What interests you about this role?", "timerSec": 20},
        {"difficulty": "medium", "text": "Describe a challenging project you worked on", "timerSec": 60},
        {"difficulty": "medium", "text": "How do you handle tight deadlines?", "timerSec": 60},
        {"difficulty": "hard", "text": "Explain a complex technical problem you solved", "timerSec": 120},
        {"difficulty": "hard", "text": "Where do you see yourself in 5 years?", "timerSec": 120}
      ];
    }

    const formattedQuestions = questions.map(function(q, idx) {
      return {
        id: 'q-' + Date.now() + '-' + idx,
        index: idx,
        difficulty: q.difficulty,
        text: q.text,
        timerSec: q.timerSec
      };
    });

    const session = {
      id: sessionId,
      candidateId: String(candidateId),
      role: role,
      startedAt: new Date().toISOString(),
      questions: formattedQuestions,
      finished: false
    };

    db.get('sessions').push(session).write();

    res.json({ session: session });
  } catch (error) {
    console.error('Session start error:', error);
    res.status(500).json({ error: 'Failed to start interview session' });
  }
});

router.post('/answer', async function(req, res) {
  try {
    const { sessionId, questionIndex, answer, autoSubmitted } = req.body;

    const session = db.get('sessions').find({ id: sessionId }).value();
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const question = session.questions[questionIndex];
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const prompt = `Evaluate this interview answer on a scale of 0-10:

Question: ${question.text}
Difficulty: ${question.difficulty}
Answer: ${answer || 'No answer provided'}

Provide:
1. Score (0-10)
2. Brief feedback (2-3 sentences)

Format as JSON: {"score": number, "feedback": "text"}`;

    let evaluationText;
    try {
      evaluationText = await aiGenerate(prompt);
    } catch (error) {
      console.error('Evaluation failed, using default');
      evaluationText = JSON.stringify({ score: 5, feedback: 'Evaluation service unavailable.' });
    }

    let evaluation;
    try {
      const cleanedText = evaluationText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      evaluation = JSON.parse(cleanedText);
    } catch (parseError) {
      evaluation = { score: 5, feedback: 'Evaluation service unavailable.' };
    }

    question.answer = answer;
    question.score = evaluation.score;
    question.feedback = evaluation.feedback;
    question.answeredAt = new Date().toISOString();
    question.autoSubmitted = autoSubmitted || false;

    const allAnswered = session.questions.every(function(q) { return q.score !== undefined; });
    if (allAnswered) {
      const totalScore = session.questions.reduce(function(sum, q) { return sum + q.score; }, 0);
      const avgScore = totalScore / session.questions.length;
      session.finished = true;
      session.finalScore = avgScore;
      session.summary = 'Candidate average score: ' + avgScore.toFixed(1);

      const candidate = db.get('candidates').find({ id: session.candidateId }).value();
      if (candidate) {
        candidate.lastInterview = {
          sessionId: session.id,
          finalScore: avgScore,
          summary: session.summary,
          date: new Date().toISOString()
        };
        db.get('candidates').find({ id: session.candidateId }).assign(candidate).write();
      }
    }

    db.get('sessions').find({ id: sessionId }).assign(session).write();

    res.json({ session: session });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ error: 'Failed to submit answer' });
  }
});

router.get('/sessions', function(req, res) {
  try {
    const sessions = db.get('sessions').value();
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

router.get('/sessions/:id', function(req, res) {
  try {
    const session = db.get('sessions').find({ id: req.params.id }).value();
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json(session);
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

module.exports = router;