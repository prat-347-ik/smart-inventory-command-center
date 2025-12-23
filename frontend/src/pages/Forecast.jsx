import { useState } from 'react';
import { analyticsApi } from '../api/analytics.api';
import { Link } from 'react-router-dom';
import SalesForecastChart from '../components/charts/SalesForecastChart';

const Forecast = () => {
  const [sku, setSku] = useState('MON-001');
  const [forecastResponse, setForecastResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchForecast = async () => {
    setLoading(true);
    setError('');
    setForecastResponse(null);
    try {
      const data = await analyticsApi.getForecast(sku, 7);
      setForecastResponse(data);
    } catch (err) {
      console.error(err);
      setError("Failed to generate forecast. Ensure the backend is running and SKU exists.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>🔮 Demand Forecasting (ML Engine)</h2>
        <Link to="/dashboard" style={{ textDecoration: 'none', color: '#2563eb' }}>← Dashboard</Link>
      </div>

      <div style={{ 
        backgroundColor: '#f8fafc', 
        padding: '20px', 
        borderRadius: '8px',
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        marginBottom: '30px',
        border: '1px solid #e2e8f0'
      }}>
        <label style={{ fontWeight: 'bold' }}>Product SKU:</label>
        <input 
          value={sku} 
          onChange={(e) => setSku(e.target.value)} 
          placeholder="e.g., MON-001"
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', width: '200px' }}
        />
        <button 
          onClick={fetchForecast} 
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Running ML Model...' : 'Generate Forecast'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '15px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {forecastResponse && (
        <div style={{ animation: 'fadeIn 0.5s ease-in' }}>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
            <div style={statCardStyle}>
              <span style={labelStyle}>Model Used</span>
              <strong>{forecastResponse.model_used || 'Linear Regression'}</strong>
            </div>
            <div style={statCardStyle}>
              <span style={labelStyle}>Confidence Score (R²)</span>
              <strong style={{ color: forecastResponse.confidence_score > 0.8 ? 'green' : 'orange' }}>
                {forecastResponse.confidence_score?.toFixed(2) || 'N/A'}
              </strong>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <SalesForecastChart 
              data={forecastResponse.forecast_data} 
              sku={forecastResponse.product_sku} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Simple inline styles for the "Stat Cards"
const statCardStyle = {
  backgroundColor: 'white',
  padding: '15px',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
};

const labelStyle = {
  fontSize: '0.85rem',
  color: '#64748b',
  marginBottom: '5px'
};

export default Forecast;