import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ user, setUser, cartCount = 0, onCartClick, notificationCount = 0 }) => {
    const navigate = useNavigate();

    const logoutHandler = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
        navigate('/login');
    };

    return (
        <header className="navbar">
            <Link to={user?.role === 'admin' ? '/owner-dashboard' : '/'} className="nav-brand">
                🍔 CanteenHub
            </Link>

            <nav className="nav-links">
                {user?.role === 'admin' ? (
                    <>
                        <Link to="/owner-dashboard" className="nav-item">Dashboard</Link>
                        <Link to="/owner-menu" className="nav-item">Menu Manager</Link>
                    </>
                ) : (
                    <>
                        <Link to="/" className="nav-item">Menu</Link>
                        <Link to="/track" className="nav-item">
                            Orders
                            {notificationCount > 0 && <span className="badge">{notificationCount}</span>}
                        </Link>
                    </>
                )}


                <div className="nav-item" style={{ marginLeft: '1rem', paddingLeft: '1rem', borderLeft: '1px solid var(--color-border)' }}>
                    <span style={{ marginRight: '1rem', fontWeight: 600 }}>{user?.name}</span>
                    <button onClick={logoutHandler} className="btn btn-outline" style={{ padding: '0.4rem 1rem' }}>
                        Logout
                    </button>
                </div>
            </nav>
        </header>
    );
};

export default Navbar;
