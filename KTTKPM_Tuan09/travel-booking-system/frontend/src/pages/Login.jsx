import React, { useState } from 'react';
import { Card, Input, Button, Typography, message, Space } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const { Title, Text } = Typography;
const ORCHESTRATOR_URL = import.meta.env.VITE_ORCHESTRATOR_URL;

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      message.error('Please enter both username and password');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${ORCHESTRATOR_URL}/login`, { username, password });
      
      if (response.data.success) {
        message.success(`Welcome back, ${response.data.data.name}!`);
        onLogin(response.data.data);
        navigate('/');
      } else {
        message.error(response.data.message || 'Login failed');
      }
    } catch (error) {
      message.error('Network error or server unavailable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3}>Login</Title>
        </div>
        
        <Space orientation="vertical" size="large" style={{ width: '100%' }}>
          <Input 
            size="large"
            placeholder="Username" 
            prefix={<UserOutlined />} 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input.Password
            size="large"
            placeholder="Password" 
            prefix={<LockOutlined />} 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onPressEnter={handleLogin}
          />
          <Button 
            type="primary" 
            size="large" 
            block 
            onClick={handleLogin}
            loading={loading}
          >
            Log in
          </Button>
          
          <div style={{ textAlign: 'center' }}>
            <Text>Don't have an account? <Link to="/register">Register here</Link></Text>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default Login;
