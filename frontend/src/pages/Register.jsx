import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../dataStore';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        regNo: '',
        userType: 'Dayscholar',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match. Please re-enter.');
            return;
        }

        if (formData.password.length < 4) {
            setError('Password must be at least 4 characters long.');
            return;
        }

        setLoading(true);
        try {
            registerUser(formData);
            alert('Account created successfully! You can now log in.');
            navigate('/login');
        } catch (err) {
            setError(err.message || 'Registration failed');
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card" style={{ maxWidth: '500px' }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>🎓</div>
                    <h2 className="auth-title" style={{ margin: 0 }}>Student Registration</h2>
                    <p className="auth-subtitle">Create your CanteenHub account</p>
                </div>

                {error && (
                    <div style={{ color: 'var(--color-danger)', borderLeft: '4px solid var(--color-danger)', padding: '10px 14px', background: '#ffebee', borderRadius: '4px', marginBottom: '15px', fontSize: '0.9rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={submitHandler}>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label className="form-label" htmlFor="name">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            className="form-input"
                            placeholder="e.g. Yasvonth Kumar"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="username">Student ID / Roll No</label>
                            <input
                                type="text"
                                id="username"
                                className="form-input"
                                placeholder="e.g. 927621CS001"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="userType">Category</label>
                            <select
                                id="userType"
                                className="form-input"
                                value={formData.userType}
                                onChange={handleChange}
                                required
                            >
                                <option value="Dayscholar">Dayscholar</option>
                                <option value="Hosteller">Hosteller</option>
                                <option value="Staff">Faculty / Staff</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label className="form-label" htmlFor="email">College Email Address</label>
                        <input
                            type="email"
                            id="email"
                            className="form-input"
                            placeholder="student@college.edu"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                className="form-input"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', fontWeight: 700 }}
                    >
                        {loading ? 'Creating Account...' : 'Register Account ➔'}
                    </button>
                </form>

                <div className="auth-switch" style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #eee', fontSize: '0.95rem' }}>
                    Already registered? <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Login Here</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
