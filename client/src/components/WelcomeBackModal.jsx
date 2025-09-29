import React from 'react';
import { Modal, Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { clearSession } from '../features/interview/interviewSlice';

export default function WelcomeBackModal({ onContinue }) {
  const interview = useSelector(s => s.interview.currentSession);
  const dispatch = useDispatch();

  if (!interview || interview.finished) return null;

  return (
    <Modal
      open={!!interview && !interview.finished}
      title="Welcome Back!"
      footer={null}
      closable={false}
      maskClosable={false}
    >
      <p>You have an unfinished interview session.</p>
      <p>Would you like to continue from where you left off?</p>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
        <Button onClick={() => { dispatch(clearSession()); }}>Start New</Button>
        <Button type="primary" onClick={onContinue}>Continue</Button>
      </div>
    </Modal>
  );
}