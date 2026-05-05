import { useState, useEffect } from 'react';
import axios from 'axios';
import API from '../api';
import { useCart } from '../contexts/CartContext';

function MovieList() {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [seatInputs, setSeatInputs] = useState({});
    const [addedMsg, setAddedMsg] = useState(null);
    const { addToCart } = useCart();

    useEffect(() => {
        fetchMovies();
    }, []);

    const fetchMovies = async () => {
        try {
            const res = await axios.get(`${API.GATEWAY}/movies`);
            setMovies(res.data.data);
        } catch (err) {
            console.error('Error fetching movies:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = (movie) => {
        const seats = seatInputs[movie._id] || 1;
        addToCart(movie, seats);
        setAddedMsg(movie._id);
        setTimeout(() => setAddedMsg(null), 1500);
    };

    if (loading) return <div className="no-data">Đang tải danh sách phim...</div>;
    if (movies.length === 0) return <div className="no-data">Chưa có phim nào</div>;

    return (
        <div>
            <h2 style={{ color: '#e94560', marginBottom: 16 }}>Danh sách phim</h2>
            <div className="movie-grid">
                {movies.map(movie => (
                    <div key={movie._id} className="movie-card">
                        <h3>{movie.title}</h3>
                        <p>{movie.description}</p>
                        <p>Thể loại: {movie.genre}</p>
                        <p>Thời lượng: {movie.duration} phút</p>
                        <p>Suất chiếu: {movie.showtime}</p>
                        <div className="price">{movie.price.toLocaleString('vi-VN')}đ / vé</div>
                        <div className="seats">Ghế trống: {movie.availableSeats}/{movie.totalSeats}</div>
                        <div className="movie-card-actions">
                            <input
                                type="number"
                                min={1}
                                max={movie.availableSeats}
                                value={seatInputs[movie._id] || 1}
                                onChange={e => setSeatInputs(prev => ({ ...prev, [movie._id]: Math.max(1, parseInt(e.target.value) || 1) }))}
                                className="seat-input"
                            />
                            <button
                                onClick={() => handleAddToCart(movie)}
                                disabled={movie.availableSeats === 0}
                                className={addedMsg === movie._id ? 'added' : ''}
                            >
                                {addedMsg === movie._id ? '✓ Đã thêm' : movie.availableSeats > 0 ? '🛒 Thêm vào giỏ' : 'Hết ghế'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MovieList;
