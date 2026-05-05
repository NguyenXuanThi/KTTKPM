import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

function Auth({ addLog }) {
    const { login, register } = useAuth();
    const [isRegister, setIsRegister] = useState(false);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState(null);

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await register(username, email, password);
            addLog('USER_REGISTERED', `User: ${username}, Email: ${email}`);
            setMessage({ type: 'success', text: 'Đăng ký thành công! Hãy đăng nhập.' });
            setIsRegister(false);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Đăng ký thất bại' });
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Đăng nhập thất bại' });
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>🎬 Movie Ticket System</h2>
                {message && <div className={`message ${message.type}`}>{message.text}</div>}

                {isRegister ? (
                    <form onSubmit={handleRegister}>
                        <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
                        <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                        <button type="submit">Đăng ký</button>
                        <div className="toggle">
                            Đã có tài khoản? <span onClick={() => setIsRegister(false)}>Đăng nhập</span>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleLogin}>
                        <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                        <button type="submit">Đăng nhập</button>
                        <div className="toggle">
                            Chưa có tài khoản? <span onClick={() => setIsRegister(true)}>Đăng ký</span>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default Auth;
