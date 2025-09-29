import React, { useEffect, useState, useRef } from 'react';
import { Card, Button, Progress, Input, Typography, message, Modal } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { startSession, submitAnswer, setCurrentIndex, clearSession } from '../features/interview/interviewSlice';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './InterviewFlow.css';

const { TextArea } = Input;
const { Title } = Typography;

export default function InterviewFlow() {
  const dispatch = useDispatch();
  const interview = useSelector(s => s.interview.currentSession);
  const curIndex = useSelector(s => s.interview.currentIndex);
  const loading = useSelector(s => s.interview.loading);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const candidateId = searchParams.get('candidateId');

  const [answerText, setAnswerText] = useState('');
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);
  const isSubmittingRef = useRef(false);

  const handleStart = async () => {
    if (!candidateId) {
      message.error('Candidate ID missing.');
      return;
    }
    await dispatch(startSession({ candidateId: candidateId, role: 'fullstack' }));
  };

  useEffect(() => {
    if (!interview || !interview.questions || !interview.questions[curIndex]) return;
    
    const q = interview.questions[curIndex];
    
    setTimer(q.timerSec || 30);
    setAnswerText(q.answer || '');
    isSubmittingRef.current = false;

    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (!isSubmittingRef.current) {
            isSubmittingRef.current = true;
            handleSubmit(true);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [interview, curIndex]);

  const handleSubmit = async (auto = false) => {
    if (!interview || isSubmittingRef.current) return;
    
    isSubmittingRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);

    const textToSend = (answerText || '').trim();
    
    try {
      const resultAction = await dispatch(submitAnswer({ 
        sessionId: interview.id, 
        questionIndex: curIndex, 
        answer: textToSend, 
        autoSubmitted: auto 
      }));

      if (submitAnswer.fulfilled.match(resultAction)) {
        const updatedSession = resultAction.payload;
        
        if (curIndex < updatedSession.questions.length - 1) {
          dispatch(setCurrentIndex(curIndex + 1));
        } else {
          Modal.success({
            title: 'Interview Complete',
            content: (
              <>
                <p>Final Score: {updatedSession.finalScore?.toFixed(1) || 'N/A'}</p>
                <p>{updatedSession.summary || 'Thank you for completing the interview!'}</p>
              </>
            ),
            onOk: () => {
              dispatch(clearSession());
              navigate('/interviewee');
            }
          });
        }
      }
    } catch (error) {
      message.error('Failed to submit answer');
      console.error(error);
    } finally {
      isSubmittingRef.current = false;
    }
  };

  if (!interview) {
    return (
      <Card title="Interview">
        <Button type="primary" onClick={handleStart} loading={loading}>
          Start AI-Generated Interview
        </Button>
      </Card>
    );
  }

  const q = interview.questions[curIndex];
  if (!q) {
    return <Card title="Loading...">Please wait...</Card>;
  }

  const percent = Math.round(((curIndex + 1) / interview.questions.length) * 100);

  return (
    <Card title={`Q${curIndex + 1} of ${interview.questions.length}`}>
      <Title level={5}>{q.text}</Title>
      <div className="meta-row">
        <div>Difficulty: {q.difficulty}</div>
        <div>Time left: <strong>{timer}s</strong></div>
      </div>

      <TextArea 
        rows={6} 
        value={answerText} 
        onChange={e => setAnswerText(e.target.value)} 
        placeholder="Type your answer..."
        disabled={loading}
      />

      <div className="actions">
        <Button onClick={() => setAnswerText('')} disabled={loading}>Clear</Button>
        <Button 
          type="primary" 
          onClick={() => handleSubmit(false)} 
          loading={loading}
          disabled={isSubmittingRef.current}
        >
          Submit
        </Button>
      </div>

      <Progress percent={percent} style={{ marginTop: 16 }} />

      {q.feedback && (
        <div className="feedback">
          <p><strong>Feedback:</strong> {q.feedback}</p>
          <p><strong>Score:</strong> {q.score}/10</p>
        </div>
      )}
    </Card>
  );
}