import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import Interviewee from './pages/Interviewee';
import Interviewer from './pages/Interviewer';
import InterviewFlow from './pages/InterviewFlow';


const { Header, Content } = Layout;

export default function App() {
  return (
    <BrowserRouter>
      <Layout style={{ minHeight: '100vh' }}>
        <Header>
          <div style={{ float: 'left', color: 'white', fontWeight: 700 }}>Crisp Interview</div>
          <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['interviewee']} style={{ marginLeft: 200 }}>
            <Menu.Item key="interviewee"><Link to="/interviewee">Interviewee</Link></Menu.Item>
            <Menu.Item key="interviewer"><Link to="/interviewer">Interviewer</Link></Menu.Item>
          </Menu>
        </Header>
        <Content style={{ padding: 24 }}>
          <Routes>
            <Route path="/" element={<Interviewee />} />
            <Route path="/interview" element={<InterviewFlow />} />
            <Route path="/interviewee" element={<Interviewee />} />
            <Route path="/interviewer" element={<Interviewer />} />
          </Routes>
        </Content>
      </Layout>
    </BrowserRouter>
  );
}
