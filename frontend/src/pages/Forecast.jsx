// frontend/src/pages/Forecast.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { analyticsApi } from '../api/analytics.api';
import { operationalApi } from '../api/operational.api'; // <--- UPDATED IMPORT
import useAuth from '../hooks/useAuth';
import SalesForecastChart from '../components/charts/SalesForecastChart';
import InventoryBurnChart from '../components/charts/InventoryBurnChart'; // <--- NEW IMPORT

const Forecast = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // --- State ---
  const [sku, setSku] = useState(''); 
  const [days, setDays] = useState(7);
  const [forecastResponse, setForecastResponse] = useState(null);
  const [productData, setProductData] = useState(null); // <--- NEW STATE (For stock levels)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- Handlers ---
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const fetchForecast = async () => {
    if (!sku) return;
    setLoading(true);
    setError('');
    setForecastResponse(null);
    setProductData(null);

    try {
      // Fetch Forecast AND Product Details (Current Stock) in parallel
      const [forecastResult, productResult] = await Promise.all([
        analyticsApi.getForecast(sku, days),
        operationalApi.getProduct(sku)
      ]);

      setForecastResponse(forecastResult);
      setProductData(productResult);

    } catch (err) {
      console.error(err);
      setError("Failed to retrieve data. Ensure SKU exists and services are running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      
      {/* --- SIDEBAR --- */}
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
          <Link to="/orders" style={styles.navItem}>
            <span style={styles.navIcon}>📝</span> Orders
          </Link>
          <Link to="/forecast" style={{ ...styles.navItem, ...styles.activeNavItem }}>
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
          <h2 style={styles.pageTitle}>Demand Intelligence</h2>
          <p style={styles.pageSubtitle}>AI-driven sales predictions to optimize stock levels.</p>
        </header>

        {/* 1. Control Bar */}
        <div style={styles.controlBar}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Target SKU:</label>
            <input 
              value={sku} 
              onChange={(e) => setSku(e.target.value)} 
              placeholder="e.g. MACBOOK-PRO-M3"
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Horizon (Days):</label>
            <input 
              type="number"
              min="1"
              max="90" 
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value) || 7)}
              style={{ ...styles.input, width: '120px' }}
            />
          </div>

          <button 
            onClick={fetchForecast} 
            disabled={loading || !sku}
            style={loading ? { ...styles.button, opacity: 0.7 } : styles.button}
          >
            {loading ? 'Running ML Engine...' : 'Generate Prediction'}
          </button>
        </div>

        {/* 2. Error Message */}
        {error && (
          <div style={styles.errorAlert}>
            <span style={{ fontSize: '1.2rem', marginRight: '10px' }}>⚠️</span>
            {error}
          </div>
        )}

        {/* 3. Results Section */}
        {forecastResponse && (
          <div style={styles.resultsContainer}>
            
            {/* Metric Cards */}
            <div style={styles.metricsGrid}>
              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>Model Used</span>
                <strong style={styles.metricValue}>{forecastResponse.model_used || 'Linear Regression'}</strong>
              </div>
              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>Confidence Score (R²)</span>
                <strong style={{ 
                  ...styles.metricValue, 
                  color: (forecastResponse.confidence_score || 0) > 0.8 ? '#16a34a' : '#d97706' 
                }}>
                  {forecastResponse.confidence_score?.toFixed(2) || 'N/A'}
                </strong>
              </div>
              {/* NEW: Current Stock Metric */}
              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>Current Stock</span>
                <strong style={{ 
                  ...styles.metricValue,
                  color: productData?.current_stock <= productData?.low_stock_threshold ? '#dc2626' : '#0f172a'
                }}>
                  {productData ? productData.current_stock : '-'}
                </strong>
              </div>
            </div>

            {/* Chart 1: Forecast Curve */}
            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>Projected Demand Curve</h3>
              <div style={styles.chartWrapper}>
                <SalesForecastChart 
                  data={forecastResponse.forecast_data} 
                  sku={forecastResponse.product_sku} 
                />
              </div>
            </div>

            {/* Chart 2: Inventory Burn Down (NEW) */}
            {productData && (
              <InventoryBurnChart 
                currentStock={productData.current_stock}
                forecastData={forecastResponse.forecast_data}
                lowStockThreshold={productData.low_stock_threshold}
              />
            )}

          </div>
        )}
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
    position: 'fixed',
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
  userName: { fontSize: '0.9rem', fontWeight: '600' },
  userRole: { fontSize: '0.75rem', opacity: 0.8 },
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
  navIcon: { fontSize: '1.2rem' },
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
  mainContent: {
    flex: 1,
    marginLeft: '260px',
    padding: '3rem',
    overflowY: 'auto',
  },
  header: { marginBottom: '2rem' },
  pageTitle: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 0.5rem 0',
  },
  pageSubtitle: { color: '#64748b', fontSize: '1rem', margin: 0 },
  controlBar: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'flex-end',
    gap: '1rem',
    marginBottom: '2rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: { fontSize: '0.9rem', fontWeight: '600', color: '#334155' },
  input: {
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '1px solid #94a3b8',
    fontSize: '1rem',
    outline: 'none',
    backgroundColor: 'white',
    color: 'black',
  },
  button: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)',
    height: '46px',
  },
  errorAlert: {
    padding: '1rem',
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    borderRadius: '8px',
    marginBottom: '2rem',
    display: 'flex',
    alignItems: 'center',
    borderLeft: '4px solid #ef4444',
  },
  resultsContainer: { animation: 'fadeIn 0.5s ease-out' },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  metricCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  metricLabel: {
    fontSize: '0.85rem',
    color: '#64748b',
    marginBottom: '0.5rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: '600',
  },
  metricValue: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#0f172a',
  },
  chartCard: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
  },
  chartTitle: {
    margin: '0 0 1.5rem 0',
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#1e293b',
  },
  chartWrapper: {
    width: '100%',
    height: '400px',
  }
};

export default Forecast;