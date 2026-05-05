import React, { useState } from 'react';
import { Drawer, List, Button, Typography, Modal, message } from 'antd';
import axios from 'axios';

const { Text, Title } = Typography;
const ORCHESTRATOR_URL = import.meta.env.VITE_ORCHESTRATOR_URL;

const CartDrawer = ({ visible, onClose, cart, setCart, user, setUser, onCheckoutSuccess }) => {
  const [loading, setLoading] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    try {
      const response = await axios.post(`${ORCHESTRATOR_URL}/checkout-cart`, {
        userId: user.id,
        tourIds: cart.map(item => item.id)
      });

      if (response.data.success) {
        setCart([]);
        setUser(prev => ({ ...prev, balance: prev.balance - response.data.data.totalPaid }));
        if (onCheckoutSuccess) onCheckoutSuccess();
        Modal.success({
          title: 'Checkout Successful!',
          content: `You paid $${response.data.data.totalPaid} for ${response.data.data.toursBooked} tours.`
        });
        onClose();
      } else {
        Modal.error({
          title: 'Checkout Failed',
          content: response.data.message
        });
      }
    } catch (err) {
      Modal.error({ title: 'Error', content: 'Could not connect to server.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer title="Your Cart" placement="right" onClose={onClose} open={visible}>
      <List
        dataSource={cart}
        renderItem={(item, index) => (
          <List.Item
            actions={[
              <Button danger size="small" onClick={() => {
                const newCart = [...cart];
                newCart.splice(index, 1);
                setCart(newCart);
              }}>Remove</Button>
            ]}
          >
            <List.Item.Meta title={item.name} description={`$${item.price}`} />
          </List.Item>
        )}
      />
      <div style={{ marginTop: 24, textAlign: 'right' }}>
        <Title level={4}>Total: ${total}</Title>
        <Button type="primary" size="large" onClick={handleCheckout} loading={loading} disabled={cart.length === 0}>
          Checkout
        </Button>
      </div>
    </Drawer>
  );
};

export default CartDrawer;
