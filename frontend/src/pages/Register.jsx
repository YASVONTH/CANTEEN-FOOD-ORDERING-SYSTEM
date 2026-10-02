import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerDemoUser } from '../demoStore';

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
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setError('');

        // Validations
        if (!formData.regNo.startsWith('92762')) {
            setError('Registration number must start with 92762');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            registerDemoUser(formData);
            navigate('/login');
        } catch (err) {
            setError(err.message || 'Registration failed');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card" style={{ maxWidth: '500px' }}>
                <h2 className="auth-title">Student Registration</h2>
                <p className="auth-subtitle">Create a new Canteen account</p>

                {error && (
                    <div className="p-3 mb-4 rounded" style={{ color: 'var(--color-danger)', borderLeft: '4px solid var(--color-danger)', padding: '10px', background: '#ffebee', marginBottom: '15px' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={submitHandler}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="name">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            className="form-input"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            className="form-input"
                            placeholder="johndoe123"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="regNo">Registration Number</label>
                        <input
                            type="text"
                            id="regNo"
                            className="form-input"
                            placeholder="Must start with 92762..."
                            value={formData.regNo}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="userType">Role / Type</label>
                        <select
                            id="userType"
                            className="form-input"
                            value={formData.userType}
                            onChange={handleChange}
                            required
                        >
                            <option value="Dayscholar">Dayscholar</option>
                            <option value="Hosteller">Hosteller</option>
                            <option value="Staff">Staff</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            className="form-input"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="form-input"
                            placeholder="Enter password"
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
                            placeholder="Confirm password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}>
                        Register
                    </button>
                </form>

                <div className="auth-switch" style={{ marginTop: '2rem', fontSize: '0.95rem' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Login Here</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
