import { useState } from 'react';
import axios from 'axios';
import API from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

function Cart({ addLog }) {
    const { user } = useAuth();
    const { cartItems, removeFromCart, updateSeats, clearCart, totalAmount } = useCart();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleCheckout = async () => {
        if (cartItems.length === 0) return;
        setLoading(true);
        setMessage(null);

        try {
            for (const item of cartItems) {
                await axios.post(`${API.GATEWAY}/bookings`, {
                    userId: user._id || user.id,
                    movieId: item.movie._id || item.movie.id,
                    movieTitle: item.movie.title,
                    seats: item.seats,
                    price: item.movie.price,
                    userEmail: user.email,
                });
                addLog('BOOKING_CREATED', `Phim: ${item.movie.title}, Ghế: ${item.seats}, Tổng: ${(item.movie.price * item.seats).toLocaleString('vi-VN')}đ`);
            }
            clearCart();
            setMessage({ type: 'success', text: 'Đã tạo đơn hàng! Vui lòng thanh toán trong mục "Đơn hàng".' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Đặt vé thất bại' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 style={{ color: '#e94560', marginBottom: 16 }}>🛒 Giỏ hàng</h2>
            {message && <div className={`message ${message.type}`}>{message.text}</div>}

            {cartItems.length === 0 ? (
                <div className="no-data">Giỏ hàng trống</div>
            ) : (
                <>
                    <div className="cart-items">
                        {cartItems.map(item => (
                            <div key={item.movie._id || item.movie.id} className="cart-item">
                                <div className="cart-item-info">
                                    <h3>{item.movie.title}</h3>
                                    <p>Suất chiếu: {item.movie.showtime}</p>
                                    <p>Giá: {item.movie.price.toLocaleString('vi-VN')}đ / vé</p>
                                </div>
                                <div className="cart-item-actions">
                                    <div className="qty-control">
                                        <button onClick={() => updateSeats(item.movie._id || item.movie.id, item.seats - 1)}>−</button>
                                        <span>{item.seats}</span>
                                        <button onClick={() => updateSeats(item.movie._id || item.movie.id, item.seats + 1)}>+</button>
                                    </div>
                                    <div className="cart-item-price">
                                        {(item.movie.price * item.seats).toLocaleString('vi-VN')}đ
                                    </div>
                                    <button className="btn-remove" onClick={() => removeFromCart(item.movie._id || item.movie.id)}>
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="cart-footer">
                        <div className="cart-total">
                            Tổng cộng: <strong>{totalAmount.toLocaleString('vi-VN')}đ</strong>
                        </div>
                        <button className="btn-checkout" onClick={handleCheckout} disabled={loading}>
                            {loading ? 'Đang xử lý...' : 'Đặt vé & Thanh toán'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default Cart;
