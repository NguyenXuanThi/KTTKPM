import { useState, useEffect } from 'react';
import axios from 'axios';
import API from '../api';

function BookingForm({ user, addLog }) {
    const [bookings, setBookings] = useState([]);
    const [loadingPayment, setLoadingPayment] = useState(null);

    useEffect(() => {
        fetchBookings();
    }, [user]);

    const fetchBookings = async () => {
        try {
            const res = await axios.get(`${API.GATEWAY}/bookings/user/${user._id || user.id}`);
            setBookings(res.data.data);
        } catch (err) {
            console.error('Error fetching bookings:', err);
        }
    };

    const handlePay = async (booking) => {
        // Nếu đã có paymentLink thì redirect luôn
        if (booking.paymentLink) {
            window.location.href = booking.paymentLink;
            return;
        }

        // Nếu chưa có, gọi API lấy payment link từ payment-service
        setLoadingPayment(booking._id);
        try {
            const res = await axios.get(`${API.GATEWAY}/payments/booking/${booking._id}`);
            if (res.data.success && res.data.data?.paymentLink) {
                window.location.href = res.data.data.paymentLink;
            } else {
                alert('Link thanh toán chưa sẵn sàng. Vui lòng thử lại sau vài giây.');
                // Refresh bookings để cập nhật paymentLink nếu đã có
                fetchBookings();
            }
        } catch (err) {
            alert('Không thể lấy link thanh toán. Vui lòng thử lại.');
        } finally {
            setLoadingPayment(null);
        }
    };

    return (
        <div>
            <div className="booking-list">
                <h2 style={{ color: '#e94560', marginBottom: 16 }}>📋 Đơn hàng của bạn</h2>
                <button className="btn-refresh" onClick={fetchBookings}>
                    🔄 Refresh
                </button>
                {bookings.length === 0 ? (
                    <div className="no-data">Chưa có đơn hàng nào. Hãy thêm phim vào giỏ hàng!</div>
                ) : (
                    bookings.map(b => (
                        <div key={b._id} className="booking-item">
                            <div className="booking-item-info">
                                <strong>{b.movieTitle}</strong>
                                <p>Ghế: {b.seats} | Tổng: {b.totalPrice.toLocaleString('vi-VN')}đ</p>
                                <p className="booking-time">{new Date(b.createdAt).toLocaleString('vi-VN')}</p>
                                {b.status === 'PENDING' && (
                                    <button
                                        className="btn-pay"
                                        onClick={() => handlePay(b)}
                                        disabled={loadingPayment === b._id}
                                    >
                                        {loadingPayment === b._id ? '⏳ Đang tải...' : '💳 Thanh toán ngay'}
                                    </button>
                                )}
                            </div>
                            <span className={`status ${b.status}`}>{
                                b.status === 'CONFIRMED' ? '✅ Đã thanh toán' :
                                    b.status === 'FAILED' ? '❌ Thất bại' :
                                        '⏳ Chờ thanh toán'
                            }</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default BookingForm;
