// frontend/src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { operationalApi } from '../api/operational.api';

const Login = () => {
  const navigate = useNavigate();
  
  // Toggle State: true = Login, false = Register
  const [isLoginMode, setIsLoginMode] = useState(true);

  const [formData, setFormData] = useState({
    username: '',
    email: 'admin@logistics.com',
    password: 'securepassword123',
    role: 'ADMIN'
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError('');
    // Optional: Clear form or keep data for UX
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let data;
      
      if (isLoginMode) {
        // --- LOGIN MODE ---
        console.log("Attempting Login...", formData.email);
        data = await operationalApi.login(formData.email, formData.password);
      } else {
        // --- REGISTER MODE ---
        console.log("Attempting Registration...", formData);
        data = await operationalApi.register(
          formData.username,
          formData.email,
          formData.password,
          formData.role
        );
      }
      
      handleAuthSuccess(data);

    } catch (err) {
      console.error("Auth Error:", err);
      const msg = err.response?.data?.message || err.message;
      setError(msg || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (backendData) => {
    const token = backendData?.token;
    const user = backendData?.user;

    if (token && user) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      // Redirect to Dashboard
      window.location.href = '/dashboard';
    } else {
      setError("Received invalid data from server.");
    }
  };

  return (
    <div style={styles.container}>
      {/* LEFT SIDE: Visual Branding */}
      <div style={styles.brandSection}>
        <div style={styles.brandContent}>
          <h1 style={styles.brandTitle}>Smart Inventory</h1>
          <h2 style={styles.brandSubtitle}>Command Center</h2>
          <p style={styles.brandText}>
            AI-driven logistics, real-time demand forecasting, and seamless supply chain management.
          </p>
          <div style={styles.statBox}>
            <div>
              <span style={styles.statNumber}>98%</span>
              <span style={styles.statLabel}>Forecast Accuracy</span>
            </div>
            <div style={{height: '30px', width: '1px', background: 'rgba(255,255,255,0.3)'}}></div>
            <div>
              <span style={styles.statNumber}>24/7</span>
              <span style={styles.statLabel}>System Uptime</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Auth Form */}
      <div style={styles.formSection}>
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h3 style={styles.formTitle}>
              {isLoginMode ? 'Welcome Back' : 'Create Account'}
            </h3>
            <p style={styles.formSubtitle}>
              {isLoginMode 
                ? 'Enter your credentials to access the dashboard' 
                : 'Register your organization to get started'}
            </p>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            
            {/* REGISTER ONLY: Username */}
            {!isLoginMode && (
              <div style={styles.inputGroup}>
                <label style={styles.label}>Username</label>
                <input
                  name="username"
                  style={styles.input}
                  value={formData.username}
                  onChange={handleChange}
                  required={!isLoginMode}
                  placeholder="logistics_manager"
                />
              </div>
            )}

            {/* BOTH: Email */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                name="email"
                type="email"
                style={styles.input}
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="name@company.com"
              />
            </div>

            {/* BOTH: Password */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                name="password"
                type="password"
                style={styles.input}
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />
            </div>

            {/* REGISTER ONLY: Role */}
            {!isLoginMode && (
              <div style={styles.inputGroup}>
                <label style={styles.label}>Role</label>
                <select
                  name="role"
                  style={styles.select}
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="ADMIN">Admin (Full Control)</option>
                  <option value="STAFF">Staff (View Only)</option>
                </select>
              </div>
            )}

            <button 
              type="submit" 
              style={loading ? { ...styles.button, opacity: 0.7 } : styles.button}
              disabled={loading}
            >
              {loading 
                ? 'Processing...' 
                : (isLoginMode ? 'Sign In' : 'Create Account')
              }
            </button>
            
            {/* Toggle Link */}
            <div style={styles.toggleContainer}>
              <p style={styles.toggleText}>
                {isLoginMode ? "Don't have an account?" : "Already have an account?"}
              </p>
              <button 
                type="button" 
                onClick={toggleMode} 
                style={styles.toggleButton}
              >
                {isLoginMode ? 'Register' : 'Login'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    fontFamily: "'Inter', sans-serif",
    overflow: 'hidden',
  },
  brandSection: {
    flex: '1',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '4rem',
    color: 'white',
  },
  brandContent: { maxWidth: '500px' },
  brandTitle: {
    fontSize: '1.5rem',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    opacity: 0.8,
    margin: 0,
  },
  brandSubtitle: {
    fontSize: '3.5rem',
    fontWeight: '800',
    margin: '10px 0 20px',
    lineHeight: 1.1,
  },
  brandText: {
    fontSize: '1.1rem',
    lineHeight: '1.6',
    opacity: 0.9,
    marginBottom: '3rem',
  },
  statBox: {
    display: 'flex',
    gap: '2rem',
    alignItems: 'center',
    background: 'rgba(255, 255, 255, 0.1)',
    padding: '1.5rem',
    borderRadius: '12px',
    backdropFilter: 'blur(10px)',
  },
  statNumber: { display: 'block', fontSize: '1.8rem', fontWeight: '700' },
  statLabel: { fontSize: '0.85rem', opacity: 0.8 },
  
  formSection: {
    flex: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    padding: '2rem',
  },
  formCard: {
    width: '100%',
    maxWidth: '420px',
    padding: '3rem',
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
  },
  formHeader: { marginBottom: '2rem' },
  formTitle: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 0.5rem',
  },
  formSubtitle: { color: '#64748b', margin: 0 },
  form: { display: 'flex', flexDirection: 'column', gap: '1.2rem' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  label: { fontSize: '0.9rem', fontWeight: '600', color: '#334155' },
  input: {
    padding: '0.85rem',
    borderRadius: '8px',
    border: '1px solid #94a3b8',
    fontSize: '1rem',
    outline: 'none',
    backgroundColor: '#ffffff',
    color: '#000000',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  },
  select: {
    padding: '0.85rem',
    borderRadius: '8px',
    border: '1px solid #94a3b8',
    fontSize: '1rem',
    backgroundColor: '#ffffff',
    color: '#000000',
    cursor: 'pointer',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  },
  button: {
    marginTop: '0.5rem',
    padding: '1rem',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#2563eb',
    color: 'white',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)',
    transition: 'opacity 0.2s',
  },
  error: {
    padding: '0.75rem',
    marginBottom: '1.5rem',
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    borderRadius: '8px',
    fontSize: '0.9rem',
    borderLeft: '4px solid #ef4444',
  },
  toggleContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '1rem',
    fontSize: '0.9rem',
    color: '#64748b',
  },
  toggleText: { margin: 0 },
  toggleButton: {
    background: 'none',
    border: 'none',
    color: '#2563eb',
    fontWeight: '600',
    cursor: 'pointer',
    padding: 0,
    fontSize: '0.9rem',
    textDecoration: 'underline',
  }
};

export default Login;