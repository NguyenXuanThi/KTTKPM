import React, { useEffect, useState } from 'react';
import { List, Card, Button, Spin, message, Typography } from 'antd';
import { Link } from 'react-router-dom';
import axios from 'axios';

const { Title, Text } = Typography;
const ORCHESTRATOR_URL = import.meta.env.VITE_ORCHESTRATOR_URL;

const TourList = ({ addToCart }) => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const response = await axios.get(`${ORCHESTRATOR_URL}/tours`);
        if (response.data.success) {
          setTours(response.data.data);
        } else {
          message.error('Failed to load tours');
        }
      } catch (error) {
        message.error('Failed to connect to the server');
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
  }

  return (
    <div>
      <Title level={2}>Available Tours</Title>
      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={tours}
        renderItem={tour => (
          <List.Item>
            <Card title={tour.name} extra={<Link to={`/tours/${tour.id}`}>Details</Link>}>
              <Text strong>Price: ${tour.price}</Text>
              <br />
              <Text>{tour.description}</Text>
              <br />
              <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                <Link to={`/tours/${tour.id}`}>
                  <Button type="default">Details</Button>
                </Link>
                <Button type="primary" onClick={() => addToCart(tour)}>Add to Cart</Button>
              </div>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default TourList;
