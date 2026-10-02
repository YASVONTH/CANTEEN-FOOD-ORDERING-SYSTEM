import { useState, useEffect } from 'react';
import { getOrdersForUser, subscribeToDataChanges, cancelOrder } from '../dataStore';
import { Link } from 'react-router-dom';

const OrderTracking = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReceipt, setSelectedReceipt] = useState(null);

    const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};

    useEffect(() => {
        const refreshOrders = () => {
            if (userInfo._id || userInfo.studentId) {
                const userOrders = getOrdersForUser(userInfo._id || userInfo.studentId);
                setOrders(userOrders);
            }
            setLoading(false);
        };
        refreshOrders();
        return subscribeToDataChanges(refreshOrders);
    }, [userInfo._id, userInfo.studentId]);

    const getStatusStep = (status) => {
        switch (status) {
            case 'Ordered': return 1;
            case 'Preparing': return 2;
            case 'Ready for Pickup': return 3;
            case 'Completed': return 4;
            case 'Cancelled': return 0;
            default: return 1;
        }
    };

    const handleCancel = (orderId) => {
        if (window.confirm('Are you sure you want to cancel this order?')) {
            cancelOrder(orderId);
        }
    };

    return (
        <div className="orders-page">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 className="header-title" style={{ margin: 0 }}>Live Order Tracking</h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
                        Track your meal preparation and pickup token in real-time
                    </p>
                </div>

                <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    + Order More Food
                </Link>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                    <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto 1rem auto' }}></div>
                    <p style={{ color: 'var(--color-text-muted)' }}>Loading your orders...</p>
                </div>
            ) : orders.length === 0 ? (
                <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🧾</div>
                    <h2>No orders yet</h2>
                    <p style={{ color: 'var(--color-text-muted)', maxWidth: '400px', margin: '0.5rem auto 1.5rem auto' }}>
                        You have not placed any orders today. Browse the menu and get your meal with a digital token!
                    </p>
                    <Link to="/" className="btn btn-primary" style={{ padding: '0.8rem 1.8rem' }}>
                        Browse Menu Now ➔
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {orders.map((order) => {
                        const step = getStatusStep(order.status);
                        const isCancelled = order.status === 'Cancelled';
                        const isReady = order.status === 'Ready for Pickup';

                        return (
                            <div
                                className="card"
                                key={order._id}
                                style={{
                                    padding: '1.5rem',
                                    borderLeft: isReady
                                        ? '6px solid var(--color-success)'
                                        : order.status === 'Preparing'
                                        ? '6px solid var(--color-warning)'
                                        : isCancelled
                                        ? '6px solid var(--color-danger)'
                                        : '6px solid var(--color-primary)',
                                    boxShadow: isReady ? '0 8px 25px rgba(40, 167, 69, 0.25)' : 'var(--shadow-md)',
                                    position: 'relative'
                                }}
                            >
                                {/* Top Header Info */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        {/* High Visibility Token Box */}
                                        <div style={{
                                            background: 'linear-gradient(135deg, #1c1c1c 0%, #333 100%)',
                                            color: '#ffc107',
                                            padding: '0.6rem 1rem',
                                            borderRadius: '0.75rem',
                                            textAlign: 'center',
                                            minWidth: '90px'
                                        }}>
                                            <div style={{ fontSize: '0.65rem', letterSpacing: '1px', color: '#fff', fontWeight: 600 }}>TOKEN</div>
                                            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>#{order.tokenNumber}</div>
                                        </div>

                                        <div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                                Order ID: <strong>{order._id}</strong>
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                                                Placed at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {order.paymentMethod || 'UPI'} ({order.paymentStatus || 'Paid'})
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <button
                                            className="btn btn-outline"
                                            onClick={() => setSelectedReceipt(order)}
                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                                        >
                                            🧾 View Receipt
                                        </button>

                                        {order.status === 'Ordered' && (
                                            <button
                                                className="btn btn-danger"
                                                onClick={() => handleCancel(order._id)}
                                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Ready for pickup callout */}
                                {isReady && (
                                    <div style={{
                                        background: '#d4edda',
                                        border: '1px solid #c3e6cb',
                                        color: '#155724',
                                        padding: '1rem',
                                        borderRadius: '0.75rem',
                                        marginBottom: '1.25rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        animation: 'pulse 2s infinite'
                                    }}>
                                        <span style={{ fontSize: '1.6rem' }}>🔔</span>
                                        <div>
                                            <strong>Your food is READY!</strong>
                                            <div style={{ fontSize: '0.85rem' }}>
                                                Please show Token <strong>#{order.tokenNumber}</strong> at the counter to collect your meal.
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Visual Multi-Step Progress Tracker */}
                                {!isCancelled && (
                                    <div style={{ margin: '1.5rem 0', background: '#fafafa', padding: '1.25rem', borderRadius: '0.75rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', maxWidth: '600px', margin: '0 auto' }}>
                                            {/* Progress connecting line */}
                                            <div style={{
                                                position: 'absolute',
                                                top: '16px',
                                                left: '10%',
                                                right: '10%',
                                                height: '4px',
                                                background: '#e0e0e0',
                                                zIndex: 1
                                            }}>
                                                <div style={{
                                                    height: '100%',
                                                    width: step === 1 ? '0%' : step === 2 ? '50%' : '100%',
                                                    background: 'var(--color-primary)',
                                                    transition: 'width 0.5s ease'
                                                }}></div>
                                            </div>

                                            {/* Step 1: Placed */}
                                            <div style={{ textAlign: 'center', zIndex: 2, position: 'relative' }}>
                                                <div style={{
                                                    width: '34px',
                                                    height: '34px',
                                                    borderRadius: '50%',
                                                    background: step >= 1 ? 'var(--color-primary)' : '#ddd',
                                                    color: 'white',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    margin: '0 auto 0.4rem auto',
                                                    fontWeight: 700,
                                                    fontSize: '0.9rem'
                                                }}>
                                                    ✓
                                                </div>
                                                <div style={{ fontSize: '0.8rem', fontWeight: step === 1 ? 700 : 500 }}>
                                                    Received
                                                </div>
                                            </div>

                                            {/* Step 2: Preparing */}
                                            <div style={{ textAlign: 'center', zIndex: 2, position: 'relative' }}>
                                                <div style={{
                                                    width: '34px',
                                                    height: '34px',
                                                    borderRadius: '50%',
                                                    background: step >= 2 ? '#ffc107' : '#ddd',
                                                    color: step >= 2 ? '#000' : 'white',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    margin: '0 auto 0.4rem auto',
                                                    fontWeight: 700,
                                                    fontSize: '0.9rem'
                                                }}>
                                                    🍳
                                                </div>
                                                <div style={{ fontSize: '0.8rem', fontWeight: step === 2 ? 700 : 500 }}>
                                                    Cooking
                                                </div>
                                            </div>

                                            {/* Step 3: Ready */}
                                            <div style={{ textAlign: 'center', zIndex: 2, position: 'relative' }}>
                                                <div style={{
                                                    width: '34px',
                                                    height: '34px',
                                                    borderRadius: '50%',
                                                    background: step >= 3 ? '#28a745' : '#ddd',
                                                    color: 'white',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    margin: '0 auto 0.4rem auto',
                                                    fontWeight: 700,
                                                    fontSize: '0.9rem'
                                                }}>
                                                    🥡
                                                </div>
                                                <div style={{ fontSize: '0.8rem', fontWeight: step === 3 ? 700 : 500, color: step === 3 ? 'var(--color-success)' : 'inherit' }}>
                                                    Ready
                                                </div>
                                            </div>

                                            {/* Step 4: Completed */}
                                            <div style={{ textAlign: 'center', zIndex: 2, position: 'relative' }}>
                                                <div style={{
                                                    width: '34px',
                                                    height: '34px',
                                                    borderRadius: '50%',
                                                    background: step === 4 ? '#333' : '#ddd',
                                                    color: 'white',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    margin: '0 auto 0.4rem auto',
                                                    fontWeight: 700,
                                                    fontSize: '0.9rem'
                                                }}>
                                                    ✓
                                                </div>
                                                <div style={{ fontSize: '0.8rem', fontWeight: step === 4 ? 700 : 500 }}>
                                                    Delivered
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Items Breakdown */}
                                <div style={{ borderTop: '1px solid #eee', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {order.orderItems.map((item, idx) => (
                                            <span
                                                key={idx}
                                                style={{
                                                    background: '#f1f2f6',
                                                    padding: '0.3rem 0.6rem',
                                                    borderRadius: '0.4rem',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 500
                                                }}
                                            >
                                                {item.qty}x {item.name} (₹{item.price * item.qty})
                                            </span>
                                        ))}
                                    </div>

                                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                                        Total: ₹{order.totalPrice.toFixed(2)}
                                    </div>
                                </div>

                                {order.notes && (
                                    <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#666', fontStyle: 'italic' }}>
                                        Note: &quot;{order.notes}&quot;
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Receipt Modal */}
            {selectedReceipt && (
                <div className="modal-overlay" style={{ backdropFilter: 'blur(6px)', zIndex: 9999 }}>
                    <div className="modal-content" style={{ maxWidth: '420px', padding: '1.75rem', borderRadius: '1rem' }}>
                        <div style={{ textAlign: 'center', borderBottom: '2px dashed #ddd', paddingBottom: '1rem', marginBottom: '1rem' }}>
                            <h2 style={{ fontSize: '1.4rem', margin: '0 0 0.2rem 0' }}>🍔 CanteenHub</h2>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Official Digital Bill Receipt</div>
                            <div style={{
                                background: '#333',
                                color: '#ffc107',
                                display: 'inline-block',
                                padding: '0.3rem 1rem',
                                borderRadius: '0.5rem',
                                fontWeight: 800,
                                fontSize: '1.4rem',
                                marginTop: '0.75rem'
                            }}>
                                TOKEN #{selectedReceipt.tokenNumber}
                            </div>
                        </div>

                        <div style={{ fontSize: '0.85rem', marginBottom: '1rem', lineHeight: '1.6' }}>
                            <div>Order ID: <strong>{selectedReceipt._id}</strong></div>
                            <div>Student: <strong>{selectedReceipt.user?.name} ({selectedReceipt.user?.studentId})</strong></div>
                            <div>Date: {new Date(selectedReceipt.createdAt).toLocaleString()}</div>
                            <div>Payment: <strong>{selectedReceipt.paymentMethod} ({selectedReceipt.paymentStatus})</strong></div>
                        </div>

                        <div style={{ borderTop: '1px solid #eee', borderBottom: '1px solid #eee', padding: '0.75rem 0', marginBottom: '1rem' }}>
                            {selectedReceipt.orderItems.map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                                    <span>{item.qty} x {item.name}</span>
                                    <span>₹{(item.price * item.qty).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', marginBottom: '1.5rem' }}>
                            <span>Grand Total:</span>
                            <span style={{ color: 'var(--color-primary)' }}>₹{selectedReceipt.totalPrice.toFixed(2)}</span>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-outline" onClick={() => window.print()} style={{ flex: 1 }}>
                                🖨️ Print
                            </button>
                            <button className="btn btn-primary" onClick={() => setSelectedReceipt(null)} style={{ flex: 1 }}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderTracking;
