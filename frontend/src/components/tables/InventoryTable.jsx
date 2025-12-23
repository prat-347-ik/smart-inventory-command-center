import PropTypes from 'prop-types';

const InventoryTable = ({ products }) => {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
      <thead>
        <tr style={{ textAlign: 'left', backgroundColor: '#f4f4f4' }}>
          <th style={thStyle}>SKU</th>
          <th style={thStyle}>Name</th>
          <th style={thStyle}>Category</th>
          <th style={thStyle}>Price</th>
          <th style={thStyle}>Stock</th>
          <th style={thStyle}>Status</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <tr key={product.sku} style={{ borderBottom: '1px solid #eee' }}>
            <td style={tdStyle}>{product.sku}</td>
            <td style={tdStyle}>{product.name}</td>
            <td style={tdStyle}>{product.category}</td>
            <td style={tdStyle}>${product.price}</td>
            <td style={tdStyle}>
              <strong style={{ color: product.current_stock < 20 ? 'red' : 'green' }}>
                {product.current_stock}
              </strong>
            </td>
            <td style={tdStyle}>
               {product.current_stock < 10 ? '⚠️ Low Stock' : '✅ Healthy'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const thStyle = { padding: '12px', borderBottom: '2px solid #ddd' };
const tdStyle = { padding: '12px' };

InventoryTable.propTypes = {
  products: PropTypes.array.isRequired
};

export default InventoryTable;