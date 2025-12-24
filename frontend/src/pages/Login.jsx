import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { operationalApi } from '../api/operational.api';

const Login = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: 'logistics_manager',
    email: 'admin@logistics.com',
    password: 'securepassword123',
    role: 'ADMIN'
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log("Attempting registration...", formData);
      
      const data = await operationalApi.register(
        formData.username,
        formData.email,
        formData.password,
        formData.role
      );
      
      handleAuthSuccess(data);

    } catch (err) {
      console.error("Auth Error:", err);
      const msg = err.response?.data?.message || err.message;

      if (msg && msg.includes('already exists')) {
        console.warn("User exists. Auto-logging in with Mock Credentials.");
        handleAuthSuccess(null, true);
      } else {
        setError(msg || 'Connection failed. Please check the backend.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (backendData, isFallback = false) => {
    const token = backendData?.token || 'mock-jwt-token-for-mvp-session';
    const user = backendData?.user || {
      username: formData.username,
      email: formData.email,
      role: formData.role,
      _id: '64e6b1d5c9e77c001f6a1a1a'
    };

    if (isFallback) {
      user.username = formData.username;
      user.email = formData.email;
      user.role = formData.role;
    }

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    window.location.href = '/dashboard';
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

      {/* RIGHT SIDE: Login Form */}
      <div style={styles.formSection}>
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h3 style={styles.formTitle}>Welcome Back</h3>
            <p style={styles.formSubtitle}>Enter your details to access the dashboard</p>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Username</label>
              <input
                name="username"
                style={styles.input}
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                name="email"
                type="email"
                style={styles.input}
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                name="password"
                type="password"
                style={styles.input}
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

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

            <button 
              type="submit" 
              style={loading ? { ...styles.button, opacity: 0.7 } : styles.button}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Access Dashboard'}
            </button>
            
            <p style={styles.disclaimer}>
              * MVP Mode: Registers new users or auto-logs in existing ones.
            </p>
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
  brandContent: {
    maxWidth: '500px',
  },
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
  statNumber: {
    display: 'block',
    fontSize: '1.8rem',
    fontWeight: '700',
  },
  statLabel: {
    fontSize: '0.85rem',
    opacity: 0.8,
  },
  formSection: {
    flex: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9', // Slightly darker gray background for contrast
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
  formHeader: {
    marginBottom: '2rem',
  },
  formTitle: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 0.5rem',
  },
  formSubtitle: {
    color: '#64748b',
    margin: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.2rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#334155',
  },
  // --- IMPROVED INPUT STYLES ---
  input: {
    padding: '0.85rem',
    borderRadius: '8px',
    border: '1px solid #94a3b8', // Darker border for visibility
    fontSize: '1rem',
    outline: 'none',
    backgroundColor: '#ffffff', // Pure white background
    color: '#000000',           // Pure black text for maximum contrast
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  },
  // --- IMPROVED DROPDOWN STYLES ---
  select: {
    padding: '0.85rem',
    borderRadius: '8px',
    border: '1px solid #94a3b8', // Matches input border
    fontSize: '1rem',
    backgroundColor: '#ffffff', // White background
    color: '#000000',           // Black text
    cursor: 'pointer',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  },
  button: {
    marginTop: '1rem',
    padding: '1rem',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#2563eb',
    color: 'white',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)',
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
  disclaimer: {
    fontSize: '0.8rem',
    color: '#64748b', // Darker gray for better readability
    textAlign: 'center',
    marginTop: '1rem',
  }
};

export default Login;