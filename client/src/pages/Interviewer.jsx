import React, { useEffect, useState } from 'react';
import { Table, Card, Input, Modal, Typography, Tag, Spin } from 'antd';
import axios from 'axios';
import './Interviewer.css';

const { Title, Paragraph } = Typography;

export default function Interviewer() {
  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const resp = await axios.get('http://localhost:5000/api/interviewer/candidates');
      setCandidates(resp.data);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCandidate = async (record) => {
    try {
      const resp = await axios.get(`http://localhost:5000/api/interviewer/candidate/${record.id}`);
      setSelected(resp.data);
    } catch (error) {
      console.error('Error fetching candidate details:', error);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const columns = [
    { 
      title: 'Name', 
      dataIndex: 'name', 
      key: 'name',
      render: (name) => name || 'N/A'
    },
    { 
      title: 'Email', 
      dataIndex: 'email', 
      key: 'email',
      render: (email) => email || 'N/A'
    },
    { 
      title: 'Phone', 
      dataIndex: 'phone', 
      key: 'phone',
      render: (phone) => phone || 'N/A'
    },
    {
      title: 'Score',
      dataIndex: ['lastInterview', 'finalScore'],
      key: 'score',
      render: (score) => {
        if (!score) return '—';
        const numScore = parseFloat(score);
        const color = numScore >= 7 ? 'green' : numScore >= 4 ? 'orange' : 'red';
        return <Tag color={color}>{numScore.toFixed(1)}</Tag>;
      }
    },
    {
      title: 'Summary',
      dataIndex: ['lastInterview', 'summary'],
      key: 'summary',
      render: (summary) => summary || '—'
    }
  ];

  const filtered = candidates.filter(c =>
    (c.name && c.name.toLowerCase().includes(search.toLowerCase())) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="interviewer-container">
      <Card title="Interviewer Dashboard">
        <Input.Search
          placeholder="Search by name or email"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginBottom: 16 }}
        />

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" />
          </div>
        ) : (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={filtered}
            onRow={(record) => ({
              onClick: () => openCandidate(record),
              style: { cursor: 'pointer' }
            })}
            pagination={{ pageSize: 10 }}
          />
        )}
      </Card>

      {selected && (
        <Modal
          open={!!selected}
          onCancel={() => setSelected(null)}
          width={800}
          title={`Candidate: ${selected.candidate.name || 'Unknown'}`}
          footer={null}
        >
          <Paragraph><strong>Email:</strong> {selected.candidate.email || 'N/A'}</Paragraph>
          <Paragraph><strong>Phone:</strong> {selected.candidate.phone || 'N/A'}</Paragraph>

          {selected.sessions && selected.sessions.length > 0 ? (
            selected.sessions.map((s) => (
              <Card key={s.id} title={`Session ${s.id}`} style={{ marginBottom: 16 }}>
                <Paragraph><strong>Role:</strong> {s.role}</Paragraph>
                <Paragraph><strong>Final Score:</strong> {s.finalScore?.toFixed(1) || 'N/A'}</Paragraph>
                <Paragraph><strong>Summary:</strong> {s.summary || 'N/A'}</Paragraph>
                <Paragraph><strong>Started:</strong> {new Date(s.startedAt).toLocaleString()}</Paragraph>
                
                {s.questions && s.questions.map((q, idx) => (
                  <div key={q.id} className="qa-block">
                    <Title level={5}>{idx + 1}. {q.text}</Title>
                    <Paragraph><strong>Difficulty:</strong> {q.difficulty}</Paragraph>
                    <Paragraph><strong>Answer:</strong> {q.answer || '—'}</Paragraph>
                    {q.score !== undefined && (
                      <>
                        <Paragraph><strong>Score:</strong> {q.score}/10</Paragraph>
                        <Paragraph><strong>Feedback:</strong> {q.feedback}</Paragraph>
                      </>
                    )}
                  </div>
                ))}
              </Card>
            ))
          ) : (
            <Paragraph>No interview sessions found.</Paragraph>
          )}
        </Modal>
      )}
    </div>
  );
}