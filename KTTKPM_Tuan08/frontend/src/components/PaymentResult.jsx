import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

function PaymentResult() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const status = searchParams.get('status');
    const isSuccess = status === 'success';

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/', { replace: true });
        }, 5000);
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            minHeight: '100vh', background: '#f8f9fa'
        }}>
            <div style={{
                background: '#fff', padding: 48, borderRadius: 16,
                boxShadow: '0 4px 24px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: 480
            }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>
                    {isSuccess ? '✅' : '❌'}
                </div>
                <h1 style={{ color: isSuccess ? '#22c55e' : '#ef4444', marginBottom: 12 }}>
                    {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán đã bị hủy'}
                </h1>
                <p style={{ color: '#666', marginBottom: 24 }}>
                    {isSuccess
                        ? 'Đơn hàng của bạn đã được xác nhận. Thông tin vé sẽ được gửi về email đã đăng ký.'
                        : 'Đơn hàng đã bị hủy. Bạn có thể thử lại sau.'}
                </p>
                <button
                    onClick={() => navigate('/', { replace: true })}
                    style={{
                        padding: '12px 32px', background: '#e94560', color: '#fff',
                        border: 'none', borderRadius: 8, fontSize: '1rem',
                        cursor: 'pointer', fontWeight: 'bold'
                    }}
                >
                    Quay lại trang chủ
                </button>
                <p style={{ color: '#aaa', fontSize: '0.85rem', marginTop: 16 }}>
                    Tự động chuyển hướng sau 5 giây...
                </p>
            </div>
        </div>
    );
}

export default PaymentResult;
