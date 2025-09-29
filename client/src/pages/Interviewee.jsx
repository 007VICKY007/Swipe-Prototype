import React, { useState, useEffect } from 'react';
import { Upload, Button, message, Card, Descriptions, Form, Input } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearSession } from '../features/interview/interviewSlice';
import WelcomeBackModal from '../components/WelcomeBackModal';
import './Interviewee.css';

export default function Interviewee() {
  const [fileList, setFileList] = useState([]);
  const [candidate, setCandidate] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const interview = useSelector(s => s.interview.currentSession);

  useEffect(() => {
    dispatch(clearSession());
  }, [dispatch]);

  const props = {
    accept: '.pdf,.docx',
    beforeUpload: (file) => {
      setFileList([file]);
      return false;
    },
    fileList: fileList
  };

  const handleUpload = async () => {
    if (!fileList.length) return message.error('Please select a resume file.');
    const formData = new FormData();
    formData.append('resume', fileList[0]);

    try {
      const resp = await axios.post('http://localhost:5000/api/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const parsedCandidate = {
        id: resp.data.candidateId,
        name: null,
        email: null,
        phone: null
      };

      const emailMatch = resp.data.extractedText.match(/[\w.-]+@[\w.-]+\.\w+/);
      if (emailMatch) parsedCandidate.email = emailMatch[0];

      const phoneMatch = resp.data.extractedText.match(/[\+]?[\d\s()-]{10,}/);
      if (phoneMatch) parsedCandidate.phone = phoneMatch[0].trim();

      const lines = resp.data.extractedText.split('\n');
      for (let line of lines) {
        line = line.trim();
        if (line.length > 3 && line.length < 50 && /^[A-Z][a-z]+\s+[A-Z]/.test(line)) {
          parsedCandidate.name = line;
          break;
        }
      }

      setCandidate(parsedCandidate);
      message.success('Resume parsed!');
    } catch (err) {
      console.error(err);
      message.error('Upload failed');
    }
  };

  const handleSaveMissing = async (values) => {
    const updatedCandidate = { ...candidate, ...values };
    setCandidate(updatedCandidate);
    
    try {
      await axios.patch(`http://localhost:5000/api/resume/candidates/${candidate.id}`, values);
      message.success('Details saved!');
    } catch (err) {
      console.error(err);
      message.warning('Details updated locally');
    }
  };

  const goToInterview = () => {
    if (!candidate?.id) return message.error('Candidate not ready.');
    if (!candidate.name || !candidate.email || !candidate.phone) {
      return message.error('Please fill in all required details.');
    }
    navigate(`/interview?candidateId=${candidate.id}`);
  };

  const continueInterview = () => {
    if (interview && interview.candidateId) {
      navigate(`/interview?candidateId=${interview.candidateId}`);
    }
  };

  return (
    <div className="interviewee-container">
      <WelcomeBackModal onContinue={continueInterview} />
      
      <Card title="Step 1: Upload Resume" className="upload-card">
        <Upload {...props}>
          <Button icon={<UploadOutlined />}>Select Resume</Button>
        </Upload>
        <div style={{ marginTop: 16 }}>
          <Button type="primary" onClick={handleUpload}>
            Upload & Parse
          </Button>
        </div>
      </Card>

      {candidate && (
        <Card title="Step 2: Verify your Details" className="details-card">
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Name">{candidate.name || '❌ Missing'}</Descriptions.Item>
            <Descriptions.Item label="Email">{candidate.email || '❌ Missing'}</Descriptions.Item>
            <Descriptions.Item label="Phone">{candidate.phone || '❌ Missing'}</Descriptions.Item>
          </Descriptions>

          {(!candidate.name || !candidate.email || !candidate.phone) && (
            <Card style={{ marginTop: 16 }}>
              <p>We could not find all your details. Please fill in:</p>
              <Form form={form} onFinish={handleSaveMissing}>
                {!candidate.name && (
                  <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                )}
                {!candidate.email && (
                  <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                    <Input />
                  </Form.Item>
                )}
                {!candidate.phone && (
                  <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                )}
                <Button type="primary" htmlType="submit">Save</Button>
              </Form>
            </Card>
          )}

          <div style={{ marginTop: 20 }}>
            <Button type="primary" onClick={goToInterview} size="large">
              Start Interview
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}