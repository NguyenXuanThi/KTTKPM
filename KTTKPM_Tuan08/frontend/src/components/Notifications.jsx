import { useState, useEffect } from 'react';
import axios from 'axios';
import API from '../api';

function Notifications({ userId }) {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        fetchNotifications();
    }, [userId]);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get(`${API.GATEWAY}/notifications/user/${userId}`);
            setNotifications(res.data.data);
        } catch (err) {
            console.error('Error fetching notifications:', err);
        }
    };

    return (
        <div>
            <h2 style={{ color: '#e94560', marginBottom: 16 }}>Thông báo</h2>
            <button
                onClick={fetchNotifications}
                className="btn-refresh"
            >
                🔄 Refresh
            </button>
            <div className="notification-list">
                {notifications.length === 0 ? (
                    <div className="no-data">Chưa có thông báo nào</div>
                ) : (
                    notifications.map(n => (
                        <div key={n._id} className={`notification-item ${n.type === 'BOOKING_FAILED' ? 'failed' : ''}`}>
                            <p>{n.message}</p>
                            <p className="time">{new Date(n.createdAt).toLocaleString('vi-VN')}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Notifications;
