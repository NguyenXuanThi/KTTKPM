import React, { useEffect, useState } from 'react';
import { Card, Button, Spin, message, Typography, Descriptions, Modal } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { LeftOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;
const ORCHESTRATOR_URL = import.meta.env.VITE_ORCHESTRATOR_URL;

const TourDetail = ({ user, setUser, addToCart }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const response = await axios.get(`${ORCHESTRATOR_URL}/tours/${id}`);
        if (response.data.success) {
          setTour(response.data.data);
        } else {
          message.error('Failed to load tour details');
          navigate('/');
        }
      } catch (error) {
        message.error('Failed to connect to the server');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchTour();
  }, [id, navigate]);

  const handleAddToCart = () => {
    addToCart(tour);
    navigate('/');
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
  }

  return (
    <div>
      <Button icon={<LeftOutlined />} onClick={() => navigate('/')} style={{ marginBottom: '16px' }}>
        Back to Tours
      </Button>
      <Card title={<Title level={3} style={{ margin: 0 }}>{tour.name}</Title>}>
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Description">{tour.description}</Descriptions.Item>
          <Descriptions.Item label="Price">${tour.price}</Descriptions.Item>
        </Descriptions>
        
        <div style={{ marginTop: '24px', textAlign: 'right' }}>
          <Button 
            type="primary" 
            size="large" 
            onClick={handleAddToCart}
          >
            Add to Cart
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default TourDetail;
