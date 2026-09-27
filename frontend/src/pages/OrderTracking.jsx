import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { API_BASE_URL, SOCKET_URL } from '../config';

const OrderTracking = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    useEffect(() => {
        fetchMyOrders();

        // Socket.io connection for real-time order updates
        const socket = io(SOCKET_URL);

        if (userInfo && userInfo._id) {
            socket.on(`order-status-${userInfo._id}`, (updatedOrder) => {
                setOrders(prevOrders =>
                    prevOrders.map(order => order._id === updatedOrder._id ? updatedOrder : order)
                );

                if (updatedOrder.status === 'Ready for Pickup') {
                    alert(`🔔 Your order #${updatedOrder.tokenNumber} is ready! Please collect it from the counter.`);
                }
            });
        }

        return () => {
            socket.disconnect();
        };
    }, []);

    const fetchMyOrders = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/orders/myorders`, {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`
                }
            });
            const data = await res.json();
            setOrders(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

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
                    <h2 style={{ color: 'var(--color-text-muted)' }}>You haven't placed any orders yet.</h2>
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
