import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../dataStore';

const Login = ({ setUser }) => {
    const [studentId, setStudentId] = useState('');
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

        const data = loginUser(studentId, password, 'student');
        if (!data) {
            setError('Invalid Student ID or Password. Please try again.');
            setLoading(false);
            return;
        }

        localStorage.setItem('userInfo', JSON.stringify(data));
        setUser(data);
        navigate('/');
    };

    const handleQuickLogin = (id, pass) => {
        setStudentId(id);
        setPassword(pass);
    };

    return (
        <div className="auth-container" style={{ position: 'relative' }}>
            <div className="auth-card" style={{ maxWidth: '460px' }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>🍔</div>
                    <h2 className="auth-title" style={{ margin: 0 }}>Student Login</h2>
                    <p className="auth-subtitle">Sign in to order canteen meals</p>
                </div>

                {error && (
                    <div style={{ color: 'var(--color-danger)', borderLeft: '4px solid var(--color-danger)', padding: '10px 14px', background: '#ffebee', borderRadius: '4px', marginBottom: '15px', fontSize: '0.9rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={submitHandler}>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label className="form-label" htmlFor="studentId">Student ID / Username</label>
                        <input
                            type="text"
                            id="studentId"
                            className="form-input"
                            placeholder="e.g. 927621CS001"
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                        <label className="form-label" htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="form-input"
                            placeholder="Enter your account password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', fontWeight: 700 }}
                    >
                        {loading ? 'Signing In...' : 'Sign In as Student ➔'}
                    </button>

                    {/* Quick Demo Fill */}
                    <div style={{ marginTop: '1rem', background: '#f8f9fa', padding: '0.6rem', borderRadius: '0.5rem', textAlign: 'center', fontSize: '0.8rem', color: '#666' }}>
                        Quick Fill: <button type="button" onClick={() => handleQuickLogin('927621CS001', 'password123')} style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'underline' }}>Student Sample</button>
                    </div>

                    <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.95rem' }}>
                        Don&apos;t have an account? <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Create New Account</Link>
                    </div>
                </form>

                <div className="auth-switch" style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #eee', fontSize: '0.9rem' }}>
                    Canteen Management staff? <Link to="/admin-login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Owner / Admin Login</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
