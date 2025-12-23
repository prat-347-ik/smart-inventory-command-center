import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <h1>Welcome, {user?.username}</h1>
        <button onClick={logout}>Logout</button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        <Link to="/inventory" style={cardStyle}>
          <h3>📦 Real-Time Inventory</h3>
          <p>View stock levels updating via WebSockets</p>
        </Link>
        
        <Link to="/orders" style={cardStyle}>
          <h3>📝 Place Orders</h3>
          <p>Simulate purchases to trigger forecasting events</p>
        </Link>

        <Link to="/forecast" style={cardStyle}>
          <h3>📈 Demand Forecast</h3>
          <p>View ML-generated predictions per SKU</p>
        </Link>
      </div>
    </div>
  );
};

const cardStyle = {
  border: '1px solid #ddd',
  padding: '20px',
  borderRadius: '8px',
  textDecoration: 'none',
  color: 'inherit',
  display: 'block'
};

export default Dashboard;