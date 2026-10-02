import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getOrdersForUser, getOrders, subscribeToDataChanges } from '../dataStore';

const Navbar = ({ user, setUser }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeCount, setActiveCount] = useState(0);

    useEffect(() => {
        const updateCounts = () => {
            if (!user) return;
            if (user.role === 'admin') {
                const all = getOrders();
                const active = all.filter((o) => ['Ordered', 'Preparing', 'Ready for Pickup'].includes(o.status)).length;
                setActiveCount(active);
            } else {
                const myOrders = getOrdersForUser(user._id || user.studentId);
                const active = myOrders.filter((o) => ['Ordered', 'Preparing', 'Ready for Pickup'].includes(o.status)).length;
                setActiveCount(active);
            }
        };

        updateCounts();
        return subscribeToDataChanges(updateCounts);
    }, [user]);

    const logoutHandler = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
        navigate('/login');
    };

    return (
        <header className="navbar" style={{
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.5rem' }}>
                <Link to={user?.role === 'admin' ? '/owner-dashboard' : '/'} className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.4rem' }}>
                    <span style={{ fontSize: '1.7rem' }}>🍔</span>
                    <span style={{ background: 'linear-gradient(135deg, #fc8019 0%, #e23744 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        CanteenHub
                    </span>
                </Link>

                <nav className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {user?.role === 'admin' ? (
                        <>
                            <Link
                                to="/owner-dashboard"
                                className="nav-item"
                                style={{
                                    fontWeight: location.pathname === '/owner-dashboard' ? 700 : 500,
                                    color: location.pathname === '/owner-dashboard' ? 'var(--color-primary)' : 'var(--color-text)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.35rem'
                                }}
                            >
                                📊 Dashboard
                                {activeCount > 0 && (
                                    <span style={{
                                        background: 'var(--color-primary)',
                                        color: 'white',
                                        fontSize: '0.75rem',
                                        padding: '0.1rem 0.5rem',
                                        borderRadius: '1rem',
                                        fontWeight: 700
                                    }}>
                                        {activeCount}
                                    </span>
                                )}
                            </Link>

                            <Link
                                to="/owner-menu"
                                className="nav-item"
                                style={{
                                    fontWeight: location.pathname === '/owner-menu' ? 700 : 500,
                                    color: location.pathname === '/owner-menu' ? 'var(--color-primary)' : 'var(--color-text)'
                                }}
                            >
                                🍽️ Menu Manager
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/"
                                className="nav-item"
                                style={{
                                    fontWeight: location.pathname === '/' ? 700 : 500,
                                    color: location.pathname === '/' ? 'var(--color-primary)' : 'var(--color-text)'
                                }}
                            >
                                🍕 Menu
                            </Link>

                            <Link
                                to="/track"
                                className="nav-item"
                                style={{
                                    fontWeight: location.pathname === '/track' ? 700 : 500,
                                    color: location.pathname === '/track' ? 'var(--color-primary)' : 'var(--color-text)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.35rem'
                                }}
                            >
                                📋 My Orders
                                {activeCount > 0 && (
                                    <span style={{
                                        background: '#28a745',
                                        color: 'white',
                                        fontSize: '0.75rem',
                                        padding: '0.1rem 0.5rem',
                                        borderRadius: '1rem',
                                        fontWeight: 700,
                                        animation: 'pulse 1.5s infinite'
                                    }}>
                                        {activeCount} Live
                                    </span>
                                )}
                            </Link>
                        </>
                    )}

                    {/* User Profile info & Logout */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '0.5rem', paddingLeft: '0.75rem', borderLeft: '1px solid var(--color-border)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)' }}>
                                {user?.name || 'User'}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: user?.role === 'admin' ? '#e23744' : 'var(--color-text-muted)', fontWeight: 600 }}>
                                {user?.role === 'admin' ? '🛡️ Manager' : `🎓 ${user?.studentId || 'Student'}`}
                            </span>
                        </div>

                        <button
                            onClick={logoutHandler}
                            className="btn btn-outline"
                            style={{ padding: '0.35rem 0.8rem', fontSize: '0.85rem', borderRadius: '0.5rem' }}
                        >
                            Logout
                        </button>
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default Navbar;
