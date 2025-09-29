const express = require('express');
const db = require('../db');
const { aiGenerate } = require('../utils/ai');

const router = express.Router();

// Dashboard stats (from new file)
router.get('/dashboard', function(req, res) {
  try {
    const sessions = db.get('sessions').value();
    const candidates = db.get('candidates').value();

    const stats = {
      totalCandidates: candidates.length,
      totalSessions: sessions.length,
      completedSessions: sessions.filter(function(s) { return s.finished; }).length,
      averageScore: 0
    };

    const completedSessions = sessions.filter(function(s) { return s.finished && s.finalScore; });
    if (completedSessions.length > 0) {
      const totalScore = completedSessions.reduce(function(sum, s) { return sum + s.finalScore; }, 0);
      stats.averageScore = totalScore / completedSessions.length;
    }

    res.json(stats);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get all candidates with last interview (from old file - FIXED)
router.get('/candidates', function(req, res) {
  try {
    const candidates = db.get('candidates').value();
    const list = candidates.map(function(c) {
      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        lastInterview: c.lastInterview || null
      };
    });

    // Sort by score descending
    list.sort(function(a, b) {
      const scoreA = (a.lastInterview && a.lastInterview.finalScore) || 0;
      const scoreB = (b.lastInterview && b.lastInterview.finalScore) || 0;
      return scoreB - scoreA;
    });
    
    res.json(list);
  } catch (error) {
    console.error('Candidates list error:', error);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

// Get details of one candidate with all sessions (from old file - FIXED)
router.get('/candidate/:id', function(req, res) {
  try {
    const id = req.params.id;
    const candidate = db.get('candidates').find({ id: id }).value();
    
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const sessions = db.get('sessions').filter({ candidateId: id }).value() || [];
    res.json({ candidate: candidate, sessions: sessions });
  } catch (error) {
    console.error('Candidate details error:', error);
    res.status(500).json({ error: 'Failed to fetch candidate details' });
  }
});

// Generate AI report for candidate (from new file)
router.get('/candidates/:id/report', async function(req, res) {
  try {
    const candidate = db.get('candidates').find({ id: req.params.id }).value();
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const sessions = db.get('sessions').filter({ candidateId: req.params.id }).value();

    const prompt = `Generate a comprehensive hiring report for this candidate:

Name: ${candidate.name}
Email: ${candidate.email}
Sessions Completed: ${sessions.length}
Average Score: ${sessions.length > 0 ? (sessions.reduce(function(sum, s) { return sum + (s.finalScore || 0); }, 0) / sessions.length).toFixed(1) : 'N/A'}

Interview Performance:
${sessions.map(function(s) {
  return 'Session ' + s.id + ' (' + s.role + '): Score ' + (s.finalScore || 0).toFixed(1);
}).join('\n')}

Provide:
1. Overall assessment
2. Strengths
3. Weaknesses
4. Hiring recommendation
5. Suggested role fit

Format as detailed report.`;

    let report;
    try {
      report = await aiGenerate(prompt);
    } catch (error) {
      console.error('Report generation failed');
      report = 'Report generation unavailable. Manual review recommended.';
    }

    res.json({
      candidate: candidate,
      sessions: sessions,
      report: report
    });
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Get session review details (from new file)
router.get('/sessions/:sessionId/review', function(req, res) {
  try {
    const session = db.get('sessions').find({ id: req.params.sessionId }).value();
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const candidate = db.get('candidates').find({ id: session.candidateId }).value();

    res.json({
      session: session,
      candidate: candidate
    });
  } catch (error) {
    console.error('Session review error:', error);
    res.status(500).json({ error: 'Failed to fetch session review' });
  }
});

module.exports = router;