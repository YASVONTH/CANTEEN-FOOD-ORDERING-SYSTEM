import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMenu, createOrder, subscribeToDataChanges } from '../dataStore';
import PaymentModal from '../components/PaymentModal';

const Home = () => {
    const [menu, setMenu] = useState([]);
    const [cart, setCart] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [vegOnly, setVegOnly] = useState(false);
    const [specialNotes, setSpecialNotes] = useState('');
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [orderAlert, setOrderAlert] = useState(null);

    const navigate = useNavigate();
    const categories = ['All', 'Meals', 'Snacks', 'Beverages', 'Desserts'];

    useEffect(() => {
        const loadMenu = () => {
            setMenu(getMenu());
            setLoading(false);
        };
        loadMenu();
        return subscribeToDataChanges(loadMenu);
    }, []);

    const addToCart = (item) => {
        const existing = cart.find((c) => c._id === item._id);
        if (existing) {
            setCart(cart.map((c) => (c._id === item._id ? { ...c, qty: c.qty + 1 } : c)));
        } else {
            setCart([...cart, { ...item, qty: 1 }]);
        }
    };

    const removeFromCart = (id) => {
        const existing = cart.find((c) => c._id === id);
        if (!existing) return;
        if (existing.qty === 1) {
            setCart(cart.filter((c) => c._id !== id));
        } else {
            setCart(cart.map((c) => (c._id === id ? { ...c, qty: c.qty - 1 } : c)));
        }
    };

    const getItemQtyInCart = (id) => {
        const found = cart.find((c) => c._id === id);
        return found ? found.qty : 0;
    };

    const cartTotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
    const totalCartItems = cart.reduce((a, c) => a + c.qty, 0);

    const handleOpenCheckout = () => {
        if (cart.length === 0) return;
        setIsPaymentOpen(true);
    };

    const handlePaymentSuccess = ({ paymentMethod, paymentId, paymentStatus }) => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {
            _id: 'guest',
            name: 'Student',
            studentId: 'student'
        };

        const orderItems = cart.map((item) => ({
            name: item.name,
            qty: item.qty,
            image: item.image,
            price: item.price,
            foodItem: item._id,
        }));

        const newOrder = createOrder({
            user: userInfo,
            orderItems,
            totalPrice: cartTotal,
            paymentMethod,
            paymentId,
            paymentStatus,
            notes: specialNotes
        });

        setCart([]);
        setSpecialNotes('');
        setIsSidebarOpen(false);
        setOrderAlert({
            tokenNumber: newOrder.tokenNumber,
            total: newOrder.totalPrice
        });

        return newOrder;
    };

    // Filter Menu based on Category, Search & Veg Preference
    const filteredMenu = menu.filter((item) => {
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesVeg = vegOnly ? item.isVeg === true : true;
        return matchesCategory && matchesSearch && matchesVeg;
    });

    return (
        <div className="menu-page">
            {/* Header & Hero Section */}
            <div className="hero-banner" style={{
                background: 'linear-gradient(135deg, rgba(252,128,25,0.95), rgba(226,55,68,0.95))',
                borderRadius: '1.25rem',
                padding: '2rem',
                color: 'white',
                marginBottom: '2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1.5rem',
                boxShadow: 'var(--shadow-lg)'
            }}>
                <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.2)', padding: '0.3rem 0.8rem', borderRadius: '2rem', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4cd137', display: 'inline-block' }}></span>
                        Live Kitchen Open • Express Pickup
                    </div>
                    <h1 style={{ fontSize: '2.2rem', color: 'white', marginBottom: '0.5rem', fontWeight: 800 }}>
                        College Canteen Hub
                    </h1>
                    <p style={{ opacity: 0.9, maxWidth: '480px', margin: 0 }}>
                        Order fresh, hot meals directly from your phone. Skip the long counter queues with digital tokens!
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => navigate('/track')}
                        style={{
                            background: 'white',
                            color: 'var(--color-primary)',
                            padding: '0.85rem 1.5rem',
                            borderRadius: '0.75rem',
                            fontWeight: 700,
                            boxShadow: 'var(--shadow-md)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        📋 Track My Orders
                    </button>
                </div>
            </div>

            {/* Success Banner if order placed */}
            {orderAlert && (
                <div style={{
                    background: '#e8f5e9',
                    border: '1px solid #c8e6c9',
                    color: '#2e7d32',
                    padding: '1.25rem',
                    borderRadius: '1rem',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <strong>🎉 Order confirmed with Token #{orderAlert.tokenNumber}!</strong>
                        <div style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>
                            Your meal is sent to the kitchen. You can track preparation status live.
                        </div>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate('/track')}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                    >
                        View Live Status ➔
                    </button>
                </div>
            )}

            {/* Filter Bar: Search, Category Tabs, Veg Switch */}
            <div className="filter-controls" style={{
                background: 'var(--color-surface)',
                padding: '1rem 1.25rem',
                borderRadius: '1rem',
                boxShadow: 'var(--shadow-sm)',
                marginBottom: '2rem',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                {/* Category Pills */}
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            style={{
                                padding: '0.5rem 1.2rem',
                                borderRadius: '2rem',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                border: selectedCategory === cat ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                background: selectedCategory === cat ? 'var(--color-primary)' : 'var(--color-bg)',
                                color: selectedCategory === cat ? '#fff' : 'var(--color-text)',
                                transition: 'var(--transition)'
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Veg Only Toggle */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
                        <input
                            type="checkbox"
                            checked={vegOnly}
                            onChange={(e) => setVegOnly(e.target.checked)}
                            style={{ accentColor: '#28a745', width: '18px', height: '18px' }}
                        />
                        <span style={{ color: '#28a745' }}>🌱 Pure Veg</span>
                    </label>

                    {/* Search Input */}
                    <div style={{ position: 'relative', minWidth: '220px' }}>
                        <input
                            type="text"
                            placeholder="🔍 Search dishes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="form-input"
                            style={{ padding: '0.5rem 1rem', borderRadius: '2rem', fontSize: '0.9rem' }}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                style={{ position: 'absolute', right: '10px', top: '8px', color: '#999' }}
                            >
                                &times;
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Floating Cart Button */}
            <button
                className="btn btn-primary floating-cart-btn"
                onClick={() => setIsSidebarOpen(true)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    boxShadow: '0 8px 25px rgba(252, 128, 25, 0.45)',
                    padding: '0.85rem 1.4rem'
                }}
            >
                <span style={{ fontSize: '1.2rem' }}>🛒</span>
                <span>Cart ({totalCartItems})</span>
                {cartTotal > 0 && <span style={{ background: 'rgba(0,0,0,0.2)', padding: '0.2rem 0.5rem', borderRadius: '1rem', fontSize: '0.85rem' }}>₹{cartTotal}</span>}
            </button>

            {/* Menu Items Grid */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                    <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto 1rem auto' }}></div>
                    <p style={{ color: 'var(--color-text-muted)' }}>Loading fresh canteen menu...</p>
                </div>
            ) : filteredMenu.length === 0 ? (
                <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍽️</div>
                    <h3>No items found</h3>
                    <p style={{ color: 'var(--color-text-muted)' }}>Try adjusting your search query or category filter.</p>
                </div>
            ) : (
                <div className="food-grid">
                    {filteredMenu.map((item) => {
                        const qtyInCart = getItemQtyInCart(item._id);
                        return (
                            <div className="card" key={item._id} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                <div className="food-img-container" style={{ position: 'relative', height: '180px' }}>
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="food-img"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        loading="lazy"
                                    />
                                    
                                    {/* Dietary Dot Badge */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '12px',
                                        left: '12px',
                                        background: 'white',
                                        padding: '4px',
                                        borderRadius: '4px',
                                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '20px',
                                        height: '20px'
                                    }}>
                                        <div style={{
                                            width: '10px',
                                            height: '10px',
                                            borderRadius: '50%',
                                            background: item.isVeg === false ? '#e23744' : '#28a745'
                                        }}></div>
                                    </div>

                                    {/* Availability Badge */}
                                    <div className={`food-badge ${item.isAvailable ? 'available' : ''}`}>
                                        {item.isAvailable ? 'In Stock' : 'Sold Out'}
                                    </div>

                                    {/* Prep time chip */}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '10px',
                                        right: '10px',
                                        background: 'rgba(0,0,0,0.65)',
                                        color: '#fff',
                                        padding: '3px 8px',
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        backdropFilter: 'blur(4px)'
                                    }}>
                                        ⏱ {item.prepTime || '5-10 mins'}
                                    </div>
                                </div>

                                <div className="food-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '1.25rem' }}>
                                    <div className="food-header" style={{ alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                        <div>
                                            <h3 className="food-title" style={{ fontSize: '1.15rem', marginBottom: '0.2rem' }}>{item.name}</h3>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                {item.category}
                                            </span>
                                        </div>
                                        <span className="food-price" style={{ fontSize: '1.25rem', color: 'var(--color-primary)' }}>
                                            ₹{item.price}
                                        </span>
                                    </div>

                                    {item.description && (
                                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem', flex: 1, lineHeight: 1.4 }}>
                                            {item.description}
                                        </p>
                                    )}

                                    {/* Add to Cart or Quantity Stepper */}
                                    <div style={{ marginTop: 'auto', paddingTop: '0.75rem' }}>
                                        {!item.isAvailable ? (
                                            <button className="btn" disabled style={{ width: '100%', background: '#eee', color: '#999' }}>
                                                Out of Stock
                                            </button>
                                        ) : qtyInCart > 0 ? (
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                background: 'var(--color-primary-light)',
                                                border: '1px solid var(--color-primary)',
                                                borderRadius: '0.5rem',
                                                padding: '0.3rem 0.5rem'
                                            }}>
                                                <button
                                                    onClick={() => removeFromCart(item._id)}
                                                    style={{ width: '32px', height: '32px', background: 'white', borderRadius: '4px', fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-primary)', boxShadow: 'var(--shadow-sm)' }}
                                                >
                                                    -
                                                </button>
                                                <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>{qtyInCart} in cart</span>
                                                <button
                                                    onClick={() => addToCart(item)}
                                                    style={{ width: '32px', height: '32px', background: 'var(--color-primary)', color: 'white', borderRadius: '4px', fontWeight: 700, fontSize: '1.1rem' }}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                className="btn add-btn"
                                                onClick={() => addToCart(item)}
                                                style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                                            >
                                                <span>+ Add Item</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Sliding Cart Sidebar */}
            <div className={`cart-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="cart-header">
                    <div>
                        <h2 style={{ fontSize: '1.3rem', margin: 0 }}>Your Order Cart</h2>
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                            {totalCartItems} item{totalCartItems !== 1 ? 's' : ''} added
                        </span>
                    </div>
                    <button className="close-btn" onClick={() => setIsSidebarOpen(false)}>&times;</button>
                </div>

                <div className="cart-items">
                    {cart.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--color-text-muted)' }}>
                            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🛒</div>
                            <h3 style={{ color: 'var(--color-text)' }}>Cart is Empty</h3>
                            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Add your favourite meals and drinks from the menu!</p>
                        </div>
                    ) : (
                        <>
                            {cart.map((item) => (
                                <div className="cart-item" key={item._id}>
                                    <img src={item.image} alt={item.name} className="cart-item-img" />
                                    <div className="cart-item-details">
                                        <div className="cart-item-title">{item.name}</div>
                                        <div style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
                                            ₹{item.price * item.qty} <span style={{ fontSize: '0.8rem', color: '#888', fontWeight: 400 }}>(₹{item.price} each)</span>
                                        </div>
                                        <div className="qty-controls">
                                            <button className="qty-btn" onClick={() => removeFromCart(item._id)}>-</button>
                                            <span style={{ fontWeight: 600 }}>{item.qty}</span>
                                            <button className="qty-btn" onClick={() => addToCart(item)}>+</button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Cooking Instructions Input */}
                            <div style={{ marginTop: '1.5rem', padding: '0 0.5rem' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                                    📝 Cooking Notes / Instructions (Optional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Less spicy, extra sambar, no sugar..."
                                    value={specialNotes}
                                    onChange={(e) => setSpecialNotes(e.target.value)}
                                    className="form-input"
                                    style={{ fontSize: '0.85rem' }}
                                />
                            </div>
                        </>
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="cart-footer">
                        <div style={{ marginBottom: '1rem', background: '#fdfdfd', padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid #eee' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#666', marginBottom: '0.3rem' }}>
                                <span>Item Total</span>
                                <span>₹{cartTotal.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>
                                <span>Taxes & Canteen Charges</span>
                                <span style={{ color: '#28a745' }}>FREE</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.15rem', paddingTop: '0.5rem', borderTop: '1px dashed #ddd' }}>
                                <span>To Pay</span>
                                <span style={{ color: 'var(--color-primary)' }}>₹{cartTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            className="btn btn-primary"
                            onClick={handleOpenCheckout}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                fontSize: '1.05rem',
                                fontWeight: 700,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <span>Proceed to Payment</span>
                            <span>₹{cartTotal.toFixed(2)} ➔</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Interactive Payment Gateway Modal */}
            <PaymentModal
                isOpen={isPaymentOpen}
                onClose={() => setIsPaymentOpen(false)}
                cartTotal={cartTotal}
                orderItems={cart}
                onPaymentSuccess={handlePaymentSuccess}
            />
        </div>
    );
};

export default Home;
