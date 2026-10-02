import { useState, useEffect } from 'react';
import { getDemoOrders, subscribeToDemoChanges, updateDemoOrderStatus } from '../demoStore';

const OwnerDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, todayRevenue: 0, monthRevenue: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const refreshOrders = () => {
            const data = getDemoOrders();
            setOrders(data);
            calculateStats(data);
            setLoading(false);
        };
        refreshOrders();
        return subscribeToDemoChanges(refreshOrders);
    }, []);

    const calculateStats = (data) => {
        const today = new Date();
        const todayString = today.toDateString();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        let currentOrders = data.filter(o => new Date(o.createdAt).toDateString() === todayString);
        let completedToday = currentOrders.filter(o => o.status === 'Completed');
        let todayRevenue = completedToday.reduce((acc, order) => acc + (order.totalPrice || 0), 0);

        let monthOrders = data.filter(o => {
            const d = new Date(o.createdAt);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear && o.status === 'Completed';
        });
        let monthRevenue = monthOrders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);

        setStats({
            total: currentOrders.length,
            pending: currentOrders.filter(o => o.status === 'Ordered' || o.status === 'Preparing').length,
            completed: currentOrders.filter(o => o.status === 'Completed').length,
            todayRevenue,
            monthRevenue
        });
    };

    const updateStatus = (id, status) => {
        updateDemoOrderStatus(id, status);
        const newOrders = getDemoOrders();
        setOrders(newOrders);
        calculateStats(newOrders);
    };

    return (
        <div>
            <div>
                <h1 className="header-title">Live Order Queue</h1>

                {/* Stats Section */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-title">Orders Today</div>
                        <div className="stat-value">{stats.total}</div>
                    </div>
                    <div className="stat-card" style={{ borderLeftColor: 'var(--color-warning)' }}>
                        <div className="stat-title">Pending</div>
                        <div className="stat-value text-warning">{stats.pending}</div>
                    </div>
                    <div className="stat-card" style={{ borderLeftColor: 'var(--color-success)' }}>
                        <div className="stat-title">Completed</div>
                        <div className="stat-value text-success">{stats.completed}</div>
                    </div>
                    <div className="stat-card" style={{ borderLeftColor: 'var(--color-primary)' }}>
                        <div className="stat-title">Today&apos;s Revenue</div>
                        <div className="stat-value" style={{ color: 'var(--color-primary)' }}>₹{stats.todayRevenue.toFixed(2)}</div>
                    </div>
                    <div className="stat-card" style={{ borderLeftColor: 'var(--color-primary)' }}>
                        <div className="stat-title">Monthly Revenue</div>
                        <div className="stat-value" style={{ color: 'var(--color-primary)' }}>₹{stats.monthRevenue.toFixed(2)}</div>
                    </div>
                </div>

                {/* Queue Section */}
                {loading ? (
                    <p>Loading queue...</p>
                ) : orders.length === 0 ? (
                    <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                        <p>No orders yet today.</p>
                    </div>
                ) : (
                    <div className="queue-list">
                        {orders.filter(o => o.status !== 'Completed').map(order => (
                            <div className={`queue-item ${order.status.toLowerCase().replace(' ', '-')}`} key={order._id}>

                                <div className="token-box">
                                    <div className="token-label">TOKEN</div>
                                    <div className="token-num">#{order.tokenNumber}</div>
                                </div>

                                <div className="order-details-col">
                                    <div style={{ fontWeight: 600 }}>
                                        Student ID: {order.user ? order.user.studentId : 'Unknown'}
                                    </div>
                                    <div className="items-list">
                                        {order.orderItems.map((item, i) => (
                                            <span key={i}>{item.qty}x {item.name}{i < order.orderItems.length - 1 ? ', ' : ''}</span>
                                        ))}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                                        Ordered at {new Date(order.createdAt).toLocaleTimeString()}
                                    </div>
                                </div>

                                <div className="queue-actions">
                                    {order.status === 'Ordered' && (
                                        <button className="btn btn-outline" onClick={() => updateStatus(order._id, 'Preparing')}>
                                            Start Prep
                                        </button>
                                    )}
                                    {order.status === 'Preparing' && (
                                        <button className="btn btn-primary" onClick={() => updateStatus(order._id, 'Ready for Pickup')}>
                                            Mark Ready
                                        </button>
                                    )}
                                    {order.status === 'Ready for Pickup' && (
                                        <button className="btn btn-outline" onClick={() => updateStatus(order._id, 'Completed')} style={{ borderColor: 'var(--color-success)', color: 'var(--color-success)' }}>
                                            Delivered
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OwnerDashboard;
