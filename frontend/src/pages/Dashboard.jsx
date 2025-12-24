import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      
      {/* --- SIDEBAR NAVIGATION --- */}
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
          <Link to="/dashboard" style={{ ...styles.navItem, ...styles.activeNavItem }}>
            <span style={styles.navIcon}>📊</span> Dashboard
          </Link>
          <Link to="/inventory" style={styles.navItem}>
            <span style={styles.navIcon}>📦</span> Inventory
          </Link>
          <Link to="/orders" style={styles.navItem}>
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

      {/* --- MAIN CONTENT AREA --- */}
      <main style={styles.mainContent}>
        <header style={styles.header}>
          <h2 style={styles.pageTitle}>Operational Overview</h2>
          <p style={styles.dateText}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </header>



        {/* MODULE LINKS */}
        <h3 style={styles.sectionTitle}>Quick Access Modules</h3>
        <div style={styles.moduleGrid}>
          
          <Link to="/inventory" style={styles.moduleCard}>
            <div style={{...styles.iconBox, background: '#e0f2fe', color: '#0284c7'}}>📦</div>
            <div style={styles.cardContent}>
              <h3 style={styles.cardTitle}>Inventory Management</h3>
              <p style={styles.cardDesc}>Monitor real-time stock levels across all warehouses.</p>
              <span style={styles.cardLink}>View Stock →</span>
            </div>
          </Link>

          <Link to="/orders" style={styles.moduleCard}>
            <div style={{...styles.iconBox, background: '#f0fdf4', color: '#16a34a'}}>📝</div>
            <div style={styles.cardContent}>
              <h3 style={styles.cardTitle}>Order Processing</h3>
              <p style={styles.cardDesc}>Create new purchase orders and track shipments.</p>
              <span style={styles.cardLink}>Create Order →</span>
            </div>
          </Link>

          <Link to="/forecast" style={styles.moduleCard}>
            <div style={{...styles.iconBox, background: '#f5f3ff', color: '#7c3aed'}}>📈</div>
            <div style={styles.cardContent}>
              <h3 style={styles.cardTitle}>Demand Intelligence</h3>
              <p style={styles.cardDesc}>AI-powered predictions for future product demand.</p>
              <span style={styles.cardLink}>Analyze Trends →</span>
            </div>
          </Link>

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
  
  // Sidebar
  sidebar: {
    width: '260px',
    backgroundColor: '#1e3a8a', // Matches Login Brand Color
    background: 'linear-gradient(180deg, #1e3a8a 0%, #172554 100%)',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    padding: '1.5rem',
    boxShadow: '4px 0 10px rgba(0,0,0,0.05)',
    zIndex: 10,
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
    padding: '3rem',
    overflowY: 'auto',
  },
  header: {
    marginBottom: '3rem',
  },
  pageTitle: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 0.5rem 0',
  },
  dateText: {
    color: '#64748b',
    fontSize: '1rem',
  },
  
  // Metrics
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    marginBottom: '3rem',
  },
  metricCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0',
  },
  metricLabel: {
    display: 'block',
    fontSize: '0.85rem',
    color: '#64748b',
    marginBottom: '0.5rem',
    fontWeight: '600',
  },
  metricValue: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#0f172a',
  },

  // Modules
  sectionTitle: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#334155',
    marginBottom: '1.5rem',
  },
  moduleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
  },
  moduleCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '2rem',
    textDecoration: 'none',
    color: 'inherit',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  iconBox: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    marginBottom: '1.5rem',
  },
  cardContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 0.5rem 0',
  },
  cardDesc: {
    fontSize: '0.95rem',
    color: '#64748b',
    lineHeight: '1.5',
    marginBottom: '1.5rem',
    flex: 1,
  },
  cardLink: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: '0.9rem',
    marginTop: 'auto',
  }
};

export default Dashboard;