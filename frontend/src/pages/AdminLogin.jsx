import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../dataStore';

const AdminLogin = ({ setUser }) => {
    const [adminId, setAdminId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            try {
                const parsedUser = JSON.parse(userInfo);
                if (parsedUser.role === 'admin') navigate('/owner-dashboard');
                else navigate('/');
            } catch (e) {
                localStorage.removeItem('userInfo');
            }
        }
    }, [navigate]);

    const submitHandler = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const data = loginUser(adminId, password, 'admin');
        if (!data) {
            setError('Invalid Admin Username or Password.');
            setLoading(false);
            return;
        }

        localStorage.setItem('userInfo', JSON.stringify(data));
        setUser(data);
        navigate('/owner-dashboard');
    };

    const handleQuickAdmin = () => {
        setAdminId('admin');
        setPassword('2067');
    };

    return (
        <div className="auth-container" style={{ position: 'relative' }}>
            <div className="auth-card" style={{ maxWidth: '460px', borderTop: '5px solid #1c1c1c' }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>👨‍🍳</div>
                    <h2 className="auth-title" style={{ margin: 0 }}>Canteen Manager</h2>
                    <p className="auth-subtitle">Kitchen & Counter Administration Portal</p>
                </div>

                {error && (
                    <div style={{ color: 'var(--color-danger)', borderLeft: '4px solid var(--color-danger)', padding: '10px 14px', background: '#ffebee', borderRadius: '4px', marginBottom: '15px', fontSize: '0.9rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={submitHandler}>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label className="form-label" htmlFor="adminId">Manager ID</label>
                        <input
                            type="text"
                            id="adminId"
                            className="form-input"
                            placeholder="admin"
                            value={adminId}
                            onChange={(e) => setAdminId(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                        <label className="form-label" htmlFor="password">Security PIN / Password</label>
                        <input
                            type="password"
                            id="password"
                            className="form-input"
                            placeholder="••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '0.9rem',
                            fontSize: '1rem',
                            fontWeight: 700,
                            background: '#1c1c1c',
                            color: '#ffffff',
                            borderRadius: '0.5rem'
                        }}
                    >
                        {loading ? 'Authenticating...' : 'Access Dashboard ➔'}
                    </button>

                    {/* Quick Fill Button */}
                    <div style={{ marginTop: '1rem', background: '#f8f9fa', padding: '0.6rem', borderRadius: '0.5rem', textAlign: 'center', fontSize: '0.8rem', color: '#666' }}>
                        Fill Admin Access: <button type="button" onClick={handleQuickAdmin} style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'underline' }}>admin / 2067</button>
                    </div>
                </form>

                <div className="auth-switch" style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #eee', fontSize: '0.9rem' }}>
                    Student looking to order? <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Student Portal</Link>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
