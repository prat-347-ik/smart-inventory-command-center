import PropTypes from 'prop-types';

const InventoryTable = ({ products, onStockAdjust, onDelete, userRole }) => {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', fontSize: '0.9rem' }}>
      <thead>
        <tr style={{ textAlign: 'left', backgroundColor: '#f8fafc', color: '#64748b', borderBottom: '2px solid #e2e8f0' }}>
          <th style={thStyle}>SKU</th>
          <th style={thStyle}>Product Name</th>
          <th style={thStyle}>Category</th>
          <th style={thStyle}>Stock Level</th> {/* Operational Actions here */}
          <th style={thStyle}>Status</th>
          {/* Only render Actions header if Admin */}
          {userRole === 'ADMIN' && <th style={thStyle}>Admin Actions</th>}
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <tr key={product.sku} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
            
            {/* 1. Basic Info */}
            <td style={tdStyle}>
              <span style={{ fontWeight: '600', color: '#334155' }}>{product.sku}</span>
            </td>
            <td style={tdStyle}>{product.name}</td>
            <td style={tdStyle}>
              <span style={categoryBadge}>{product.category}</span>
            </td>

            {/* 2. Stock Control (Visible to Everyone) */}
            <td style={tdStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button 
                  onClick={() => onStockAdjust(product.sku, -1)}
                  style={circleBtn}
                  disabled={product.current_stock <= 0}
                  title="Remove 1 unit"
                >
                  −
                </button>
                
                <span style={{ fontWeight: '700', fontSize: '1rem', minWidth: '30px', textAlign: 'center' }}>
                  {product.current_stock}
                </span>

                <button 
                  onClick={() => onStockAdjust(product.sku, 1)}
                  style={circleBtn}
                  title="Add 1 unit"
                >
                  +
                </button>
              </div>
            </td>

            {/* 3. Status Badges */}
            <td style={tdStyle}>
               {product.current_stock === 0 ? (
                 <span style={outOfStockBadge}>🔴 Out of Stock</span>
               ) : product.current_stock < (product.low_stock_threshold || 10) ? (
                 <span style={lowStockBadge}>⚠️ Low Stock</span>
               ) : (
                 <span style={goodStockBadge}>✅ In Stock</span>
               )}
            </td>

            {/* 4. Admin Actions (Delete / Edit) */}
            {userRole === 'ADMIN' && (
              <td style={tdStyle}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {/* EDIT Button (Placeholder for future feature) */}
                  <button 
                    style={actionBtnSecondary} 
                    title="Edit Details (Coming Soon)"
                  >
                    ✏️
                  </button>

                  {/* DELETE Button */}
                  <button 
                    onClick={() => onDelete(product.sku)}
                    style={actionBtnDanger}
                    title="Delete Product"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            )}

          </tr>
        ))}
      </tbody>
    </table>
  );
};

// --- STYLES ---
const thStyle = { padding: '16px', fontWeight: '600' };
const tdStyle = { padding: '16px', verticalAlign: 'middle', color: '#475569' };

// Buttons
const circleBtn = {
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  border: '1px solid #cbd5e1',
  backgroundColor: 'white',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#334155',
  transition: 'all 0.2s'
};

const actionBtnDanger = {
  padding: '6px 10px',
  backgroundColor: '#fee2e2',
  border: '1px solid #fca5a5',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '1rem'
};

const actionBtnSecondary = {
  padding: '6px 10px',
  backgroundColor: '#f1f5f9',
  border: '1px solid #cbd5e1',
  borderRadius: '6px',
  cursor: 'not-allowed', // Disabled until you build the Edit page
  fontSize: '1rem',
  opacity: 0.6
};

// Badges
const categoryBadge = { background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600' };
const outOfStockBadge = { background: '#fef2f2', color: '#ef4444', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', border: '1px solid #fecaca' };
const lowStockBadge = { background: '#fffbeb', color: '#b45309', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', border: '1px solid #fde68a' };
const goodStockBadge = { background: '#f0fdf4', color: '#15803d', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', border: '1px solid #bbf7d0' };

InventoryTable.propTypes = {
  products: PropTypes.array.isRequired,
  onStockAdjust: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  userRole: PropTypes.string
};

export default InventoryTable;