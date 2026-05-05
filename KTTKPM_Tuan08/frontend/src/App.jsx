import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useCart } from './contexts/CartContext';

import Auth from './components/Auth';
import Cart from './components/Cart';
import PaymentResult from './components/PaymentResult';
import './App.css';
import MovieList from './components/MovieList';
import BookingForm from './components/BookingForm';
import Notifications from './components/Notifications';
import EventLog from './components/EventLog';

function MainApp() {
    const { user, loading, logout } = useAuth();
    const { totalItems } = useCart();
    const [activeTab, setActiveTab] = useState('movies');
    const [eventLogs, setEventLogs] = useState([]);

    const addLog = (event, detail) => {
        setEventLogs(prev => [
            { id: Date.now(), event, detail, time: new Date().toLocaleTimeString() },
            ...prev,
        ]);
    };

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Đang tải...</p>
            </div>
        );
    }

    if (!user) {
        return <Auth addLog={addLog} />;
    }

    return (
        <div className="app">
            <header className="header">
                <h1>🎬 Movie Ticket System</h1>
                <div className="user-info">
                    <span>Xin chào, <b>{user.username}</b></span>
                    <button onClick={logout}>Đăng xuất</button>
                </div>
            </header>

            <nav className="tabs">
                <button className={activeTab === 'movies' ? 'active' : ''} onClick={() => setActiveTab('movies')}>
                    🎬 Danh sách phim
                </button>
                <button className={activeTab === 'cart' ? 'active' : ''} onClick={() => setActiveTab('cart')}>
                    🛒 Giỏ hàng {totalItems > 0 && <span className="badge">{totalItems}</span>}
                </button>
                <button className={activeTab === 'bookings' ? 'active' : ''} onClick={() => setActiveTab('bookings')}>
                    📋 Đơn hàng
                </button>
                <button className={activeTab === 'notifications' ? 'active' : ''} onClick={() => setActiveTab('notifications')}>
                    🔔 Thông báo
                </button>
                <button className={activeTab === 'logs' ? 'active' : ''} onClick={() => setActiveTab('logs')}>
                    📝 Event Log
                </button>
            </nav>

            <main className="content">
                {activeTab === 'movies' && <MovieList />}
                {activeTab === 'cart' && <Cart addLog={addLog} />}
                {activeTab === 'bookings' && <BookingForm user={user} addLog={addLog} />}
                {activeTab === 'notifications' && <Notifications userId={user._id || user.id} />}
                {activeTab === 'logs' && <EventLog logs={eventLogs} />}
            </main>
        </div>
    );
}

function App() {
    return (
        <Routes>
            <Route path="/payment-result" element={<PaymentResult />} />
            <Route path="/*" element={<MainApp />} />
        </Routes>
    );
}

export default App;
