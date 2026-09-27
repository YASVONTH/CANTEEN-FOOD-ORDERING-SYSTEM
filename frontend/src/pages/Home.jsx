import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import GooglePayButton from '@google-pay/button-react';

const Home = () => {
    const [menu, setMenu] = useState([]);
    const [cart, setCart] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMenu();
    }, []);

    const fetchMenu = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/menu`);
            const data = await res.json();
            setMenu(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

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

    const checkoutHandler = async () => {
        if (cart.length === 0) return;

        const userInfo = JSON.parse(localStorage.getItem('userInfo'));

        const orderItems = cart.map(item => ({
            name: item.name,
            qty: item.qty,
            image: item.image,
            price: item.price,
            foodItem: item._id
        }));

        try {
            const res = await fetch(`${API_BASE_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`
                },
                body: JSON.stringify({
                    orderItems,
                    totalPrice: cartTotal
                })
            });

            if (res.ok) {
                setCart([]);
                setIsSidebarOpen(false);
                alert('Order placed successfully! Check exactly on the Tracking page.');
            }
        } catch (error) {
            alert('Failed to place order.');
        }
    };

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className="header-title" style={{ margin: 0 }}>Canteen Menu</h1>
            </div>

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
                        <GooglePayButton
                            environment="TEST"
                            paymentRequest={{
                                apiVersion: 2,
                                apiVersionMinor: 0,
                                allowedPaymentMethods: [
                                    {
                                        type: 'CARD',
                                        parameters: {
                                            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                                            allowedCardNetworks: ['MASTERCARD', 'VISA'],
                                        },
                                        tokenizationSpecification: {
                                            type: 'PAYMENT_GATEWAY',
                                            parameters: {
                                                gateway: 'example',
                                                gatewayMerchantId: 'exampleGatewayMerchantId',
                                            },
                                        },
                                    },
                                ],
                                merchantInfo: {
                                    merchantId: '12345678901234567890',
                                    merchantName: 'CanteenHub Demo',
                                },
                                transactionInfo: {
                                    totalPriceStatus: 'FINAL',
                                    totalPriceLabel: 'Total',
                                    totalPrice: cartTotal.toFixed(2).toString(),
                                    currencyCode: 'INR',
                                    countryCode: 'IN',
                                },
                            }}
                            onLoadPaymentData={paymentRequest => {
                                console.log('Payment Successful', paymentRequest);
                                checkoutHandler();
                            }}
                            buttonType="pay"
                            buttonSizeMode="fill"
                            style={{ width: '100%', marginTop: '0.5rem' }}
                        />
                    </div>
                )}
            </div>
        </>
    );
};

export default Home;
