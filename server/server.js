require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const resumeRouter = require('./routes/resume');
const aiRouter = require('./routes/ai');
const interviewRouter = require('./routes/interview');
const interviewerRouter = require('./routes/interviewer');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/resume', resumeRouter);
app.use('/api/ai', aiRouter);
app.use('/api/interview', interviewRouter);
app.use('/api/interviewer', interviewerRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, function() {
  console.log('Server running on http://localhost:' + PORT);
});