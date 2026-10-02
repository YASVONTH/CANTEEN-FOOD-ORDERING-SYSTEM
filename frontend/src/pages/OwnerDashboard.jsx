import { useState, useEffect } from 'react';
import { getOrders, subscribeToDataChanges, updateOrderStatus } from '../dataStore';
import { Link } from 'react-router-dom';

const OwnerDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [filterStatus, setFilterStatus] = useState('Active'); // 'Active', 'Ordered', 'Preparing', 'Ready for Pickup', 'Completed', 'All'
    const [searchQuery, setSearchQuery] = useState('');
    const [stats, setStats] = useState({
        totalToday: 0,
        activeOrders: 0,
        preparing: 0,
        readyForPickup: 0,
        completedToday: 0,
        todayRevenue: 0,
        monthRevenue: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const refreshData = () => {
            const data = getOrders();
            setOrders(data);
            computeAnalytics(data);
            setLoading(false);
        };
        refreshData();
        return subscribeToDataChanges(refreshData);
    }, []);

    const computeAnalytics = (allOrders) => {
        const today = new Date();
        const todayString = today.toDateString();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        const todayOrders = allOrders.filter(
            (o) => new Date(o.createdAt).toDateString() === todayString && o.status !== 'Cancelled'
        );
        const completedToday = todayOrders.filter((o) => o.status === 'Completed');
        const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

        const monthOrders = allOrders.filter((o) => {
            const d = new Date(o.createdAt);
            return (
                d.getMonth() === currentMonth &&
                d.getFullYear() === currentYear &&
                o.status !== 'Cancelled'
            );
        });
        const monthRevenue = monthOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

        setStats({
            totalToday: todayOrders.length,
            activeOrders: todayOrders.filter((o) => ['Ordered', 'Preparing', 'Ready for Pickup'].includes(o.status)).length,
            preparing: todayOrders.filter((o) => o.status === 'Preparing').length,
            readyForPickup: todayOrders.filter((o) => o.status === 'Ready for Pickup').length,
            completedToday: completedToday.length,
            todayRevenue,
            monthRevenue,
        });
    };

    const handleUpdateStatus = (orderId, newStatus) => {
        updateOrderStatus(orderId, newStatus);
    };

    const filteredOrders = orders.filter((order) => {
        const matchesSearch =
            (order.tokenNumber && String(order.tokenNumber).includes(searchQuery)) ||
            (order.user?.name && order.user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (order.user?.studentId && order.user.studentId.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (order._id && order._id.toLowerCase().includes(searchQuery.toLowerCase()));

        if (!matchesSearch) return false;

        if (filterStatus === 'Active') {
            return ['Ordered', 'Preparing', 'Ready for Pickup'].includes(order.status);
        }
        if (filterStatus === 'All') return true;
        return order.status === filterStatus;
    });

    return (
        <div className="owner-dashboard">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 className="header-title" style={{ margin: 0 }}>Canteen Manager Console</h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
                        Live kitchen order pipeline, token management & revenue tracking
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <Link to="/owner-menu" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        🍔 Manage Menu
                    </Link>
                </div>
            </div>

            {/* Live Analytics Overview Cards */}
            <div className="stats-grid" style={{ marginBottom: '2rem' }}>
                <div className="stat-card" style={{ borderLeftColor: 'var(--color-primary)' }}>
                    <div className="stat-title">Active in Queue</div>
                    <div className="stat-value" style={{ color: 'var(--color-primary)' }}>{stats.activeOrders}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>Live Kitchen Orders</div>
                </div>

                <div className="stat-card" style={{ borderLeftColor: 'var(--color-warning)' }}>
                    <div className="stat-title">Cooking Now</div>
                    <div className="stat-value text-warning">{stats.preparing}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>On the Stove / Grill</div>
                </div>

                <div className="stat-card" style={{ borderLeftColor: 'var(--color-success)' }}>
                    <div className="stat-title">Ready at Counter</div>
                    <div className="stat-value text-success">{stats.readyForPickup}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>Awaiting Student Pickup</div>
                </div>

                <div className="stat-card" style={{ borderLeftColor: '#333' }}>
                    <div className="stat-title">Today&apos;s Revenue</div>
                    <div className="stat-value" style={{ color: '#28a745' }}>₹{stats.todayRevenue.toFixed(2)}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>{stats.totalToday} total orders</div>
                </div>

                <div className="stat-card" style={{ borderLeftColor: 'var(--color-primary)' }}>
                    <div className="stat-title">Monthly Revenue</div>
                    <div className="stat-value" style={{ color: 'var(--color-primary)' }}>₹{stats.monthRevenue.toFixed(2)}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>This Month&apos;s Sales</div>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div style={{
                background: 'var(--color-surface)',
                padding: '1rem',
                borderRadius: '1rem',
                boxShadow: 'var(--shadow-sm)',
                marginBottom: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                {/* Status Tabs */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {[
                        { label: '🔥 Active Queue', value: 'Active' },
                        { label: 'New Orders', value: 'Ordered' },
                        { label: 'Cooking', value: 'Preparing' },
                        { label: 'Ready for Pickup', value: 'Ready for Pickup' },
                        { label: 'Delivered', value: 'Completed' },
                        { label: 'All Orders', value: 'All' }
                    ].map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setFilterStatus(tab.value)}
                            style={{
                                padding: '0.45rem 0.9rem',
                                borderRadius: '2rem',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                border: filterStatus === tab.value ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                background: filterStatus === tab.value ? 'var(--color-primary)' : 'transparent',
                                color: filterStatus === tab.value ? '#fff' : 'var(--color-text)',
                                cursor: 'pointer'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Quick Token Search */}
                <div style={{ minWidth: '220px' }}>
                    <input
                        type="text"
                        placeholder="🔍 Search Token # or Student..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="form-input"
                        style={{ padding: '0.45rem 0.9rem', borderRadius: '2rem', fontSize: '0.85rem' }}
                    />
                </div>
            </div>

            {/* Orders Queue List */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                    <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto 1rem auto' }}></div>
                    <p style={{ color: 'var(--color-text-muted)' }}>Loading live orders...</p>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🍳</div>
                    <h3>No orders in this view</h3>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                        {filterStatus === 'Active' ? 'All active canteen orders have been fulfilled!' : 'No matching records found.'}
                    </p>
                </div>
            ) : (
                <div className="queue-list">
                    {filteredOrders.map((order) => {
                        const isReady = order.status === 'Ready for Pickup';
                        const isPrep = order.status === 'Preparing';
                        const isDone = order.status === 'Completed';

                        return (
                            <div
                                className={`queue-item ${isPrep ? 'preparing' : isReady ? 'ready' : ''}`}
                                key={order._id}
                                style={{
                                    borderLeft: isReady
                                        ? '6px solid var(--color-success)'
                                        : isPrep
                                        ? '6px solid var(--color-warning)'
                                        : isDone
                                        ? '6px solid #6c757d'
                                        : '6px solid var(--color-primary)',
                                    alignItems: 'center'
                                }}
                            >
                                {/* Big Token Block */}
                                <div className="token-box" style={{ background: '#222', color: '#ffc107', minWidth: '90px' }}>
                                    <div className="token-label" style={{ color: '#aaa' }}>TOKEN</div>
                                    <div className="token-num">#{order.tokenNumber}</div>
                                </div>

                                {/* Order & Customer Details */}
                                <div className="order-details-col" style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                                        <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                                            👤 {order.user?.name || 'Student'} <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', fontWeight: 400 }}>({order.user?.studentId || 'ID: ' + order.user?._id})</span>
                                        </div>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                            ⏱ {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>

                                    {/* Items List */}
                                    <div className="items-list" style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text)', margin: '0.4rem 0' }}>
                                        {order.orderItems.map((item, i) => (
                                            <span key={i} style={{ background: '#fff', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #e0e0e0', marginRight: '0.4rem', display: 'inline-block', marginBottom: '0.2rem' }}>
                                                {item.qty}x {item.name}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Order Meta / Notes */}
                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--color-text-muted)', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <span>Amount: <strong style={{ color: 'var(--color-primary)' }}>₹{order.totalPrice.toFixed(2)}</strong></span>
                                        <span>Payment: <strong>{order.paymentMethod}</strong> ({order.paymentStatus})</span>
                                        {order.notes && (
                                            <span style={{ color: '#e65100', background: '#fff3e0', padding: '1px 6px', borderRadius: '3px' }}>
                                                📝 Note: {order.notes}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Status Workflow Actions */}
                                <div className="queue-actions" style={{ minWidth: '160px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {order.status === 'Ordered' && (
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => handleUpdateStatus(order._id, 'Preparing')}
                                            style={{ width: '100%', padding: '0.6rem 1rem', background: '#ff9800', borderColor: '#ff9800' }}
                                        >
                                            🍳 Start Cooking
                                        </button>
                                    )}

                                    {order.status === 'Preparing' && (
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => handleUpdateStatus(order._id, 'Ready for Pickup')}
                                            style={{ width: '100%', padding: '0.6rem 1rem', background: '#28a745', borderColor: '#28a745' }}
                                        >
                                            🔔 Mark Ready
                                        </button>
                                    )}

                                    {order.status === 'Ready for Pickup' && (
                                        <button
                                            className="btn btn-outline"
                                            onClick={() => handleUpdateStatus(order._id, 'Completed')}
                                            style={{ width: '100%', padding: '0.6rem 1rem', borderColor: 'var(--color-success)', color: 'var(--color-success)', fontWeight: 700 }}
                                        >
                                            ✓ Hand Over Food
                                        </button>
                                    )}

                                    {order.status === 'Completed' && (
                                        <span style={{ color: '#6c757d', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center' }}>
                                            ✓ Completed & Delivered
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default OwnerDashboard;
