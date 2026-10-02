import { useState, useEffect } from 'react';
import { createDemoOrder, getDemoMenu } from '../demoStore';

const Home = () => {
    const [menu, setMenu] = useState([]);
    const [cart, setCart] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [orderMessage, setOrderMessage] = useState('');

    useEffect(() => {
        setMenu(getDemoMenu());
        setLoading(false);
    }, []);

    const addToCart = (item) => {
        const existing = cart.find(c => c._id === item._id);
        if (existing) {
            setCart(cart.map(c =>
                c._id === item._id ? { ...c, qty: c.qty + 1 } : c
            ));
        } else {
            setCart([...cart, { ...item, qty: 1 }]);
        }
    };

    const removeFromCart = (id) => {
        const existing = cart.find(c => c._id === id);
        if (existing.qty === 1) {
            setCart(cart.filter(c => c._id !== id));
        } else {
            setCart(cart.map(c =>
                c._id === id ? { ...c, qty: c.qty - 1 } : c
            ));
        }
    };

    const cartTotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

    const checkoutHandler = () => {
        if (cart.length === 0) return;

        const userInfo = JSON.parse(localStorage.getItem('userInfo'));

        const orderItems = cart.map(item => ({
            name: item.name,
            qty: item.qty,
            image: item.image,
            price: item.price,
            foodItem: item._id
        }));

        createDemoOrder({ user: userInfo, orderItems, totalPrice: cartTotal });
        setCart([]);
        setIsSidebarOpen(false);
        setOrderMessage('Demo order placed in this browser. No payment was processed.');
    };

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className="header-title" style={{ margin: 0 }}>Canteen Menu</h1>
            </div>
            {orderMessage && <p role="status" className="demo-notice">{orderMessage}</p>}

            <button className="btn btn-primary floating-cart-btn" onClick={() => setIsSidebarOpen(true)}>
                🛒 Cart ({cart.reduce((a, c) => a + c.qty, 0)})
            </button>

            {loading ? (
                <p>Loading menu...</p>
            ) : (
                <div className="food-grid">
                    {menu.map(item => (
                        <div className="card" key={item._id}>
                            <div className="food-img-container">
                                <img src={item.image} alt={item.name} className="food-img" />
                                <div className={`food-badge ${item.isAvailable ? 'available' : ''}`}>
                                    {item.isAvailable ? 'Available' : 'Out of Stock'}
                                </div>
                            </div>
                            <div className="food-content">
                                <div className="food-header">
                                    <h3 className="food-title">{item.name}</h3>
                                    <span className="food-price">₹{item.price}</span>
                                </div>
                                <div className="food-category">{item.category}</div>
                                <button
                                    className="btn add-btn"
                                    onClick={() => addToCart(item)}
                                    disabled={!item.isAvailable}
                                >
                                    {item.isAvailable ? 'Add to Cart' : 'Unavailable'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Sliding Cart */}
            <div className={`cart-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="cart-header">
                    <h2 style={{ fontSize: '1.25rem' }}>Your Order</h2>
                    <button className="close-btn" onClick={() => setIsSidebarOpen(false)}>&times;</button>
                </div>

                <div className="cart-items">
                    {cart.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginTop: '2rem' }}>
                            Your cart is empty
                        </p>
                    ) : (
                        cart.map(item => (
                            <div className="cart-item" key={item._id}>
                                <img src={item.image} alt={item.name} className="cart-item-img" />
                                <div className="cart-item-details">
                                    <div className="cart-item-title">{item.name}</div>
                                    <div style={{ color: 'var(--color-primary)', fontWeight: 600 }}>₹{item.price}</div>
                                    <div className="qty-controls">
                                        <button className="qty-btn" onClick={() => removeFromCart(item._id)}>-</button>
                                        <span>{item.qty}</span>
                                        <button className="qty-btn" onClick={() => addToCart(item)}>+</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="cart-footer">
                        <div className="cart-total">
                            <span>Total Amount</span>
                            <span>₹{cartTotal.toFixed(2)}</span>
                        </div>
                        <button className="btn btn-primary" onClick={checkoutHandler} style={{ width: '100%', marginTop: '0.5rem' }}>
                            Place Demo Order
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default Home;
