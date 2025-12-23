import { useEffect, useState } from 'react';
import { operationalApi } from '../api/operational.api';
import useSocket from '../hooks/useSocket';
import InventoryTable from '../components/tables/InventoryTable';
import { Link } from 'react-router-dom';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const { socket } = useSocket();

  // 1. Fetch Initial Data
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await operationalApi.getProducts();
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  };

  // 2. Listen for Real-Time Updates
  useEffect(() => {
    if (!socket) return;

    socket.on('INVENTORY_UPDATE', (updatedProduct) => {
      console.log('⚡ Socket Event:', updatedProduct);
      
      setProducts((prev) => 
        prev.map((p) => 
          p.sku === updatedProduct.sku 
            ? { ...p, current_stock: updatedProduct.newStock } 
            : p
        )
      );
    });

    return () => {
      socket.off('INVENTORY_UPDATE');
    };
  }, [socket]);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Real-Time Inventory</h2>
        <Link to="/dashboard">Back to Dashboard</Link>
      </div>
      <InventoryTable products={products} />
    </div>
  );
};

export default Inventory;