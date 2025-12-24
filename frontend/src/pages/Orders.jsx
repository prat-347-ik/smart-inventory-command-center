import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { operationalApi } from '../api/operational.api';
import useAuth from '../hooks/useAuth';

const Orders = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // --- Logic State ---
  const [products, setProducts] = useState([]);
  const [selectedSku, setSelectedSku] = useState('');
  const [qty, setQty] = useState(1);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  // --- Fetch Data ---
  useEffect(() => {
    operationalApi.getProducts().then(setProducts).catch(err => console.error(err));
  }, []);

  // --- Handlers ---
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleOrder = async (e) => {
    e.preventDefault();
    if (!selectedSku) return;
    
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const items = [{ sku: selectedSku, qty: parseInt(qty) }];
      // Ensure we have a user ID, fallback for MVP if context is missing
      const userId = user?._id || '64e6b1d5c9e77c001f6a1a1a';
      
      await operationalApi.createOrder(items, userId);
      
      setMessage({ 
        type: 'success', 
        text: '✅ Order placed successfully! Inventory has been updated.' 
      });
      // Reset form slightly
      setQty(1);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `❌ Error: ${error.response?.data?.message || 'Failed to place order'}` 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      
      {/* --- SIDEBAR (Duplicated for MVP w/o Layout) --- */}
      <aside style={styles.sidebar}>
        <div style={styles.brandBox}>
          <div style={styles.logo}>SI</div>
          <h1 style={styles.brandName}>Smart Inventory</h1>
        </div>

        <div style={styles.userBox}>
          <div style={styles.avatar}>
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div style={styles.userInfo}>
            <span style={styles.userName}>{user?.username || 'Guest'}</span>
            <span style={styles.userRole}>{user?.role || 'Staff'}</span>
          </div>
        </div>

        <nav style={styles.navMenu}>
          <Link to="/dashboard" style={styles.navItem}>
            <span style={styles.navIcon}>📊</span> Dashboard
          </Link>
          <Link to="/inventory" style={styles.navItem}>
            <span style={styles.navIcon}>📦</span> Inventory
          </Link>
          <Link to="/orders" style={{ ...styles.navItem, ...styles.activeNavItem }}>
            <span style={styles.navIcon}>📝</span> Orders
          </Link>
          <Link to="/forecast" style={styles.navItem}>
            <span style={styles.navIcon}>📈</span> Forecasts
          </Link>
        </nav>

        <div style={styles.sidebarFooter}>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main style={styles.mainContent}>
        <header style={styles.header}>
          <h2 style={styles.pageTitle}>Order Management</h2>
          <p style={styles.pageSubtitle}>Create purchase orders and trigger demand simulation.</p>
        </header>

        <div style={styles.contentGrid}>
          {/* Form Card */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>New Purchase Order</h3>
            </div>

            {message.text && (
              <div style={message.type === 'success' ? styles.alertSuccess : styles.alertError}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleOrder} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Select Product</label>
                <select 
                  style={styles.select}
                  value={selectedSku}
                  onChange={(e) => setSelectedSku(e.target.value)}
                  required
                >
                  <option value="">-- Choose SKU --</option>
                  {products.map(p => (
                    <option key={p.sku} value={p.sku}>
                      {p.name} (SKU: {p.sku}) — In Stock: {p.current_stock}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Quantity</label>
                <input 
                  type="number" 
                  min="1" 
                  style={styles.input}
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  required
                />
              </div>

              <div style={styles.formFooter}>
                <button 
                  type="submit" 
                  style={loading ? {...styles.button, opacity: 0.7} : styles.button}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Submit Order'}
                </button>
              </div>
            </form>
          </div>

          {/* Info Side Panel (Optional visual filler) */}
          <div style={styles.infoPanel}>
            <h4 style={styles.infoTitle}>How it works</h4>
            <p style={styles.infoText}>
              Placing an order here simulates a <strong>Sales Event</strong> or a <strong>Restock Order</strong> depending on your configuration.
            </p>
            <ul style={styles.infoList}>
              <li>Updates MongoDB Inventory immediately.</li>
              <li>Triggers WebSocket update to Dashboard.</li>
              <li>Logs event for Demand Forecasting Engine.</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- STYLES ---
const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: "'Inter', sans-serif",
  },
  
  // Sidebar (Identical to Dashboard)
  sidebar: {
    width: '260px',
    backgroundColor: '#1e3a8a',
    background: 'linear-gradient(180deg, #1e3a8a 0%, #172554 100%)',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    padding: '1.5rem',
    boxShadow: '4px 0 10px rgba(0,0,0,0.05)',
    zIndex: 10,
    position: 'fixed', // Fixed for scrolling main content
    height: '100vh',
  },
  brandBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '3rem',
  },
  logo: {
    width: '40px',
    height: '40px',
    backgroundColor: 'white',
    color: '#1e3a8a',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '1.2rem',
  },
  brandName: {
    fontSize: '1.1rem',
    fontWeight: '700',
    letterSpacing: '0.5px',
    margin: 0,
  },
  userBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '1rem',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: '12px',
    marginBottom: '2rem',
  },
  avatar: {
    width: '36px',
    height: '36px',
    backgroundColor: '#3b82f6',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  userName: {
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  userRole: {
    fontSize: '0.75rem',
    opacity: 0.8,
  },
  navMenu: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    flex: 1,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    textDecoration: 'none',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '0.95rem',
    transition: 'all 0.2s',
  },
  activeNavItem: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    color: 'white',
    fontWeight: '600',
  },
  navIcon: {
    fontSize: '1.2rem',
  },
  sidebarFooter: {
    paddingTop: '1rem',
    borderTop: '1px solid rgba(255,255,255,0.1)',
  },
  logoutBtn: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: 'transparent',
    border: '1px solid rgba(255,255,255,0.2)',
    color: 'white',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },

  // Main Content
  mainContent: {
    flex: 1,
    marginLeft: '260px', // Offset for fixed sidebar
    padding: '3rem',
    overflowY: 'auto',
  },
  header: {
    marginBottom: '2rem',
  },
  pageTitle: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 0.5rem 0',
  },
  pageSubtitle: {
    color: '#64748b',
    fontSize: '1rem',
  },
  
  // Layout Grid
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(400px, 2fr) 1fr',
    gap: '2rem',
    alignItems: 'start',
  },

  // Form Card
  card: {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
  },
  cardHeader: {
    padding: '1.5rem 2rem',
    borderBottom: '1px solid #f1f5f9',
    backgroundColor: '#fff',
  },
  cardTitle: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1e293b',
  },
  form: {
    padding: '2rem',
  },
  inputGroup: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#334155',
    marginBottom: '0.5rem',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #94a3b8',
    fontSize: '1rem',
    outline: 'none',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #94a3b8',
    fontSize: '1rem',
    outline: 'none',
    backgroundColor: 'white',
    boxSizing: 'border-box',
  },
  formFooter: {
    marginTop: '2rem',
  },
  button: {
    width: '100%',
    padding: '0.85rem',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)',
    transition: 'background 0.2s',
  },
  
  // Alerts
  alertSuccess: {
    padding: '1rem 2rem',
    backgroundColor: '#f0fdf4',
    color: '#166534',
    borderBottom: '1px solid #bbf7d0',
    fontSize: '0.95rem',
  },
  alertError: {
    padding: '1rem 2rem',
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    borderBottom: '1px solid #fecaca',
    fontSize: '0.95rem',
  },

  // Info Panel
  infoPanel: {
    backgroundColor: '#f1f5f9',
    padding: '2rem',
    borderRadius: '16px',
    color: '#475569',
  },
  infoTitle: {
    margin: '0 0 1rem 0',
    fontSize: '1.1rem',
    color: '#334155',
  },
  infoText: {
    fontSize: '0.95rem',
    lineHeight: '1.6',
    marginBottom: '1rem',
  },
  infoList: {
    paddingLeft: '1.2rem',
    fontSize: '0.9rem',
    lineHeight: '1.5',
  }
};

export default Orders;