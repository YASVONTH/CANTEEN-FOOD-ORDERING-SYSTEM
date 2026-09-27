import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import OrderTracking from './pages/OrderTracking';
import OwnerDashboard from './pages/OwnerDashboard';
import ManageMenu from './pages/ManageMenu';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check local storage for user profile on initial load
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <Router>
      <div className="app-container">
        {/* Render Navbar only if user is logged in */}
        {user && <Navbar user={user} setUser={setUser} />}

        <main className={user ? "main-content" : ""}>
          <Routes>
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin-login" element={<AdminLogin setUser={setUser} />} />

            {/* Student Routes */}
            <Route
              path="/"
              element={user && user.role === 'student' ? <Home /> : <Navigate to="/login" />}
            />
            <Route
              path="/track"
              element={user && user.role === 'student' ? <OrderTracking /> : <Navigate to="/login" />}
            />

            {/* Owner (Admin) Routes */}
            <Route
              path="/owner-dashboard"
              element={user && user.role === 'admin' ? <OwnerDashboard /> : <Navigate to="/login" />}
            />
            <Route
              path="/owner-menu"
              element={user && user.role === 'admin' ? <ManageMenu /> : <Navigate to="/login" />}
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
