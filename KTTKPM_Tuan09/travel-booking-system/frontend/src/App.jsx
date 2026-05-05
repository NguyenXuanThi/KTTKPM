import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, Menu, Typography, Button, Badge, message, Popover, List } from 'antd';
import { LogoutOutlined, ShoppingCartOutlined, BellOutlined, CheckOutlined } from '@ant-design/icons';
import axios from 'axios';
import CartDrawer from './components/CartDrawer';
import Login from './pages/Login';
import Register from './pages/Register';
import TourList from './pages/TourList';
import TourDetail from './pages/TourDetail';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

const App = () => {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${import.meta.env.VITE_ORCHESTRATOR_URL}/users/${user.id}/notifications`);
      if (res.data.success) {
        setNotifications(res.data.data.notifications?.reverse() || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
    }
  }, [user]);

  const markAsRead = async (notifId) => {
    try {
      await axios.put(`${import.meta.env.VITE_ORCHESTRATOR_URL}/users/${user.id}/notifications/${notifId}/read`);
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const notifContent = (
    <div style={{ width: 300, maxHeight: 400, overflowY: 'auto' }}>
      <List
        dataSource={notifications}
        locale={{ emptyText: 'No notifications' }}
        renderItem={item => (
          <List.Item
            actions={!item.read ? [
              <Button type="text" size="small" icon={<CheckOutlined />} onClick={() => markAsRead(item.id)} />
            ] : []}
            style={{ opacity: item.read ? 0.6 : 1 }}
          >
            <List.Item.Meta 
              title={<span style={{ fontSize: '13px' }}>{item.message}</span>} 
              description={<span style={{ fontSize: '11px' }}>{new Date(item.date).toLocaleString()}</span>} 
            />
            {!item.read && <Badge status="processing" />}
          </List.Item>
        )}
      />
    </div>
  );

  const addToCart = (tour) => {
    setCart(prev => [...prev, tour]);
    message.success(`${tour.name} added to cart`);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 50px' }}>
          <Title level={3} style={{ color: 'white', margin: 0 }}>Travel Booking</Title>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Text style={{ color: 'white' }}>Hi, {user.name} (Balance: ${user.balance})</Text>
              
              <Badge count={cart.length} offset={[-5, 5]}>
                <Button shape="circle" icon={<ShoppingCartOutlined />} onClick={() => setCartOpen(true)} />
              </Badge>
              
              <Popover placement="bottomRight" title="Notifications" content={notifContent} trigger="click">
                <Badge count={unreadCount} offset={[-5, 5]}>
                  <Button shape="circle" icon={<BellOutlined />} />
                </Badge>
              </Popover>

              <Button type="primary" danger icon={<LogoutOutlined />} onClick={handleLogout}>
                Logout
              </Button>
            </div>
          )}
        </Header>
        
        <Content style={{ padding: '50px', background: '#f0f2f5' }}>
          <div style={{ background: '#fff', padding: 24, minHeight: 280, borderRadius: 8 }}>
            <Routes>
              <Route path="/login" element={!user ? <Login onLogin={setUser} /> : <Navigate to="/" />} />
              <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
              <Route path="/" element={user ? <TourList addToCart={addToCart} /> : <Navigate to="/login" />} />
              <Route path="/tours/:id" element={user ? <TourDetail user={user} setUser={setUser} addToCart={addToCart} /> : <Navigate to="/login" />} />
            </Routes>
          </div>
        </Content>
        
        <CartDrawer visible={cartOpen} onClose={() => setCartOpen(false)} cart={cart} setCart={setCart} user={user} setUser={setUser} onCheckoutSuccess={fetchNotifications} />

        <Footer style={{ textAlign: 'center' }}>
          Travel Booking System ©2026 SOA Architecture
        </Footer>
      </Layout>
    </Router>
  );
};

export default App;
