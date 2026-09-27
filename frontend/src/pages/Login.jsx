import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';

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
            const parsedUser = JSON.parse(userInfo);
            if (parsedUser.role === 'admin') navigate('/owner-dashboard');
            else navigate('/');
        }
    }, [navigate]);

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ studentId, password }),
            });

            const data = await res.json();

            if (res.ok) {
                if (data.role === 'admin') {
                    // If admin somehow logs in here, still redirect them
                    localStorage.setItem('userInfo', JSON.stringify(data));
                    setUser(data);
                    navigate('/owner-dashboard');
                } else {
                    localStorage.setItem('userInfo', JSON.stringify(data));
                    setUser(data);
                    navigate('/');
                }
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('Cannot connect to server. Ensure Backend & MongoDB are running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container" style={{ position: 'relative' }}>
            {/* Top Left Logo (Second Image) */}
            <img 
                src="https://almashines.s3.dualstack.ap-southeast-1.amazonaws.com/assets/images/cover/1283.jpg?r=1" 
                alt="Left Background" 
                style={{ position: 'absolute', top: '30px', left: '30px', height: '120px', width: 'auto', objectFit: 'contain' }} 
            />
            {/* Top Right Logo (First Image) */}
            <img 
                src="https://pbs.twimg.com/profile_images/1718869852624982016/KnO7MtGm_400x400.jpg" 
                alt="Right Background" 
                style={{ position: 'absolute', top: '30px', right: '30px', height: '120px', width: 'auto', objectFit: 'contain', borderRadius: '50%' }} 
            />
            
            <div className="auth-card">
                <h2 className="auth-title">Student Login</h2>
                <p className="auth-subtitle">Login to Canteen Ordering System</p>

                {error && (
                    <div className="p-3 mb-4 rounded" style={{ color: 'var(--color-danger)', borderLeft: '4px solid var(--color-danger)', padding: '10px', background: '#ffebee', marginBottom: '15px' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={submitHandler}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="studentId">Username / Student ID</label>
                        <input
                            type="text"
                            id="studentId"
                            className="form-input"
                            placeholder="e.g. stu123"
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="form-input"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }} disabled={loading}>
                        {loading ? 'Logging in...' : 'Student Login'}
                    </button>

                    <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.95rem' }}>
                        Don't have an account? <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Register Here</Link>
                    </div>
                </form>

                <div className="auth-switch" style={{ marginTop: '2rem', fontSize: '0.95rem' }}>
                    Are you a Canteen Owner? <Link to="/admin-login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Admin Login Here</Link>
                </div>

                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <a
                        href="https://github.com/MYUVAN"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', color: 'var(--color-text)', fontWeight: 500 }}
                    >
                        <svg height="20" width="20" aria-hidden="true" viewBox="0 0 16 16" version="1.1" fill="currentColor">
                            <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.46-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
                        </svg>
                        Follow my GitHub
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Login;
