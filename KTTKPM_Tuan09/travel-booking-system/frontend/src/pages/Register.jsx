import React, { useState } from 'react';
import { Card, Input, Button, Typography, message, Space } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, IdcardOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const { Title, Text } = Typography;
const ORCHESTRATOR_URL = import.meta.env.VITE_ORCHESTRATOR_URL;

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!username || !password || !name || !email) {
      message.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${ORCHESTRATOR_URL}/register`, {
        username,
        password,
        name,
        email
      });

      if (response.data.success) {
        message.success('Registration successful! Please login.');
        navigate('/login');
      } else {
        message.error(response.data.message || 'Registration failed');
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
          <Title level={3}>Register</Title>
        </div>
        
        <Space orientation="vertical" size="large" style={{ width: '100%' }}>
          <Input 
            size="large"
            placeholder="Name" 
            prefix={<IdcardOutlined />} 
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input 
            size="large"
            placeholder="Email" 
            prefix={<MailOutlined />} 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
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
          />
          <Button 
            type="primary" 
            size="large" 
            block 
            onClick={handleRegister}
            loading={loading}
          >
            Register
          </Button>

          <div style={{ textAlign: 'center' }}>
            <Text>Already have an account? <Link to="/login">Login here</Link></Text>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default Register;
