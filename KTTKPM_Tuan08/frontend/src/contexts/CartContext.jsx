import { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);

    const addToCart = (movie, seats) => {
        const existing = cartItems.find(item => (item.movie._id || item.movie.id) === (movie._id || movie.id));
        if (existing) {
            setCartItems(prev => prev.map(item =>
                (item.movie._id || item.movie.id) === (movie._id || movie.id)
                    ? { ...item, seats: item.seats + seats }
                    : item
            ));
        } else {
            setCartItems(prev => [...prev, { movie, seats }]);
        }
    };

    const removeFromCart = (movieId) => {
        setCartItems(prev => prev.filter(item => (item.movie._id || item.movie.id) !== movieId));
    };

    const updateSeats = (movieId, seats) => {
        if (seats <= 0) {
            removeFromCart(movieId);
            return;
        }
        setCartItems(prev => prev.map(item =>
            (item.movie._id || item.movie.id) === movieId
                ? { ...item, seats }
                : item
        ));
    };

    const clearCart = () => setCartItems([]);

    const totalAmount = cartItems.reduce((sum, item) => sum + item.movie.price * item.seats, 0);
    const totalItems = cartItems.reduce((sum, item) => sum + item.seats, 0);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateSeats, clearCart, totalAmount, totalItems }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within CartProvider');
    return context;
}
