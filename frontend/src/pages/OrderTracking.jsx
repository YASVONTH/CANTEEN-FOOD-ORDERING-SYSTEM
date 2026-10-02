import { useState, useEffect } from 'react';
import { getDemoOrdersForUser, subscribeToDemoChanges } from '../demoStore';

const OrderTracking = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    useEffect(() => {
        const refreshOrders = () => {
            setOrders(getDemoOrdersForUser(userInfo._id));
            setLoading(false);
        };
        refreshOrders();
        return subscribeToDemoChanges(refreshOrders);
    }, [userInfo._id]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Ordered': return 'status-ordered';
            case 'Preparing': return 'status-preparing';
            case 'Ready for Pickup': return 'status-ready';
            case 'Completed': return 'bg-gray-200 text-gray-800';
            default: return '';
        }
    };

    return (
        <>
            <h1 className="header-title">My Orders</h1>

            {loading ? (
                <p>Loading your orders...</p>
            ) : orders.length === 0 ? (
                <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <h2 style={{ color: 'var(--color-text-muted)' }}>You haven&apos;t placed any orders yet.</h2>
                </div>
            ) : (
                <div className="queue-list">
                    {orders.map(order => (
                        <div className={`queue-item ${order.status === 'Preparing' ? 'preparing' : order.status === 'Ready for Pickup' ? 'ready' : ''}`} key={order._id}>

                            {/* Token Display */}
                            <div className="token-box">
                                <div className="token-label">TOKEN</div>
                                <div className="token-num">#{order.tokenNumber}</div>
                            </div>

                            {/* Order Details */}
                            <div className="order-details-col">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <strong>Total: ₹{order.totalPrice.toFixed(2)}</strong>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>

                                <div className="items-list">
                                    {order.orderItems.map((item, index) => (
                                        <span key={index}>
                                            {item.qty}x {item.name}{index < order.orderItems.length - 1 ? ', ' : ''}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Status Badge */}
                            <div style={{ minWidth: '150px', textAlign: 'right' }}>
                                <span className={`status-badge ${getStatusColor(order.status)}`}>
                                    {order.status}
                                </span>
                                {order.status === 'Ready for Pickup' && (
                                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--color-success)', fontWeight: 'bold' }}>
                                        Please collect at counter!
                                    </div>
                                )}
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </>
    );
};

export default OrderTracking;
