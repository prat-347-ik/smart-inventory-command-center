// frontend/src/pages/Inventory.jsx
import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { operationalApi } from '../api/operational.api';
import useSocket from '../hooks/useSocket';
import useAuth from '../hooks/useAuth';
import InventoryTable from '../components/tables/InventoryTable';

const Inventory = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  
  // --- State ---
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  const fileInputRef = useRef(null);

  // --- Handlers ---
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 1. Load Products (with Filters)
  const loadProducts = async () => {
    try {
      setLoading(true);
      // Pass params to the API (Requires operational.api.js update)
      const data = await operationalApi.getProducts({ 
        search: searchTerm, 
        category: categoryFilter 
      });
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. CSV Import Handlers
  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      alert("Please upload a valid CSV file.");
      return;
    }

    setUploading(true);
    try {
      const result = await operationalApi.uploadProductsCsv(file);
      alert(result.message || 'CSV Imported Successfully!');
      loadProducts();
    } catch (err) {
      console.error("Upload failed:", err);
      alert('Upload failed. Please check the file format.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 3. Quick Stock Adjustment (+/-)
  const handleStockAdjust = async (sku, amount) => {
    const product = products.find(p => p.sku === sku);
    if (!product) return;

    try {
      const newStock = product.current_stock + amount;
      if (newStock < 0) return;

      // Optimistic UI Update
      setProducts(prev => prev.map(p => 
        p.sku === sku ? { ...p, current_stock: newStock } : p
      ));

      // API Call
      await operationalApi.updateProduct(sku, { current_stock: newStock });
    } catch (err) {
      console.error("Update failed", err);
      loadProducts(); // Revert on error
    }
  };

  // 4. Delete Product (Admin Only)
  const handleDelete = async (sku) => {
    if (!window.confirm(`Are you sure you want to delete SKU: ${sku}?`)) return;
    
    try {
      await operationalApi.deleteProduct(sku);
      // Remove from UI immediately
      setProducts(prev => prev.filter(p => p.sku !== sku));
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete product. Ensure you have Admin privileges.");
    }
  };

  // --- Effects ---

  // Effect: Debounced Search & Filter
  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 500); // 500ms delay to prevent API spam while typing
    return () => clearTimeout(timer);
  }, [searchTerm, categoryFilter]);

  // Effect: Real-Time Updates
  useEffect(() => {
    if (!socket) return;

    socket.on('INVENTORY_UPDATE', (updatedProduct) => {
      setProducts((prev) => {
        const exists = prev.find(p => p.sku === updatedProduct.sku);
        if (exists) {
          return prev.map((p) => 
            p.sku === updatedProduct.sku 
              ? { ...p, current_stock: updatedProduct.newStock } 
              : p
          );
        } else {
          // Only add new products if they match current filters
          // For simplicity, we just add it to the top
          return [updatedProduct, ...prev]; 
        }
      });
    });

    return () => {
      socket.off('INVENTORY_UPDATE');
    };
  }, [socket]);

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
          <Link to="/inventory" style={{ ...styles.navItem, ...styles.activeNavItem }}>
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

      {/* --- MAIN CONTENT --- */}
      <main style={styles.mainContent}>
        <header style={styles.header}>
          <div style={styles.headerTitleBox}>
            <h2 style={styles.pageTitle}>Real-Time Inventory</h2>
            <div style={styles.liveBadge}>
              <span style={styles.pulseDot}></span> Live Updates
            </div>
          </div>
          <p style={styles.pageSubtitle}>Monitor stock levels across all distribution centers.</p>
        </header>

        {/* Inventory Card */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Inventory Management</h3>
            
            {/* SEARCH & CONTROLS */}
            <div style={styles.controlsRow}>
              
              {/* Search Input */}
              <input 
                type="text" 
                placeholder="🔍 Search SKU or Name..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
              
              {/* Category Filter */}
              <select 
                value={categoryFilter} 
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="All">All Categories</option>
                <option value="Electronics">Electronics</option>
                <option value="Accessories">Accessories</option>
                <option value="Office">Office</option>
              </select>

              {/* ACTION BUTTONS */}
              <div style={styles.actionGroup}>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv"
                  style={{ display: 'none' }}
                />

                {/* Import Button (Admin Only) */}
                {user?.role === 'ADMIN' && (
                  <button 
                    onClick={handleImportClick} 
                    disabled={uploading}
                    style={{...styles.actionBtn, backgroundColor: '#2563eb', color: 'white'}}
                  >
                    {uploading ? 'Importing...' : '📥 Import'}
                  </button>
                )}

                <button onClick={() => loadProducts()} style={styles.actionBtn}>
                  🔄 Refresh
                </button>
              </div>
            </div>
          </div>
          
          <div style={styles.tableContainer}>
            {loading ? (
              <div style={styles.loadingState}>Loading inventory data...</div>
            ) : (
              <InventoryTable 
                products={products} 
                onStockAdjust={handleStockAdjust}
                onDelete={handleDelete}
                userRole={user?.role}
              />
            )}
          </div>
          
          <div style={styles.cardFooter}>
            Total SKUs: {products.length}
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
  headerTitleBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '0.5rem',
  },
  pageTitle: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
  },
  liveBadge: {
    backgroundColor: '#dcfce7',
    color: '#166534',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  pulseDot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#22c55e',
    borderRadius: '50%',
    display: 'inline-block',
  },
  pageSubtitle: { color: '#64748b', fontSize: '1rem', margin: 0 },
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
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  cardTitle: {
    margin: 0,
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#334155',
  },
  controlsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchInput: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    width: '240px',
    fontSize: '0.9rem',
  },
  filterSelect: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.9rem',
    backgroundColor: 'white',
  },
  actionGroup: {
    display: 'flex',
    gap: '10px',
  },
  actionBtn: {
    padding: '8px 16px',
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    color: '#334155',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  tableContainer: {
    padding: '0',
    minHeight: '200px',
  },
  loadingState: {
    padding: '3rem',
    textAlign: 'center',
    color: '#94a3b8',
  },
  cardFooter: {
    padding: '1rem 2rem',
    borderTop: '1px solid #f1f5f9',
    backgroundColor: '#f8fafc',
    color: '#64748b',
    fontSize: '0.85rem',
    textAlign: 'right',
  }
};

export default Inventory;