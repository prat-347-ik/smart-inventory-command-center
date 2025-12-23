import { useState, useEffect } from 'react';
import { operationalApi } from '../api/operational.api';
import useAuth from '../hooks/useAuth';
import { Link } from 'react-router-dom';

const Orders = () => {
  const [products, setProducts] = useState([]);
  const [selectedSku, setSelectedSku] = useState('');
  const [qty, setQty] = useState(1);
  const [message, setMessage] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    operationalApi.getProducts().then(setProducts);
  }, []);

  const handleOrder = async (e) => {
    e.preventDefault();
    if (!selectedSku) return;

    try {
      // Create order with 1 item for simplicity
      const items = [{ sku: selectedSku, qty: parseInt(qty) }];
      await operationalApi.createOrder(items, user._id);
      setMessage(`✅ Order placed! Check Inventory page to see stock drop.`);
    } catch (error) {
      setMessage(`❌ Error: ${error.response?.data?.message || 'Failed'}`);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <Link to="/dashboard">← Back</Link>
      <h2>Place Order (Trigger Analytics)</h2>
      
      {message && <div style={{ padding: '10px', background: '#eef', marginBottom: '20px' }}>{message}</div>}

      <form onSubmit={handleOrder}>
        <div style={{ marginBottom: '15px' }}>
          <label>Product:</label>
          <select 
            style={{ display: 'block', width: '100%', padding: '8px' }}
            onChange={(e) => setSelectedSku(e.target.value)}
            required
          >
            <option value="">-- Select Product --</option>
            {products.map(p => (
              <option key={p.sku} value={p.sku}>
                {p.name} (Stock: {p.current_stock})
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Quantity:</label>
          <input 
            type="number" 
            min="1" 
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            style={{ display: 'block', width: '100%', padding: '8px' }}
          />
        </div>

        <button style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Submit Order
        </button>
      </form>
    </div>
  );
};

export default Orders;