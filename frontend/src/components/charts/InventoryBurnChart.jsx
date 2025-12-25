// frontend/src/components/charts/InventoryBurnChart.jsx
import PropTypes from 'prop-types';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

const InventoryBurnChart = ({ currentStock, forecastData, lowStockThreshold }) => {
  if (!forecastData || forecastData.length === 0) return null;

  // 1. Calculate Burn Down Logic
  let runningStock = currentStock;
  const burnData = forecastData.map(day => {
    runningStock = Math.max(0, runningStock - day.predicted_demand);
    return {
      date: day.date,
      stock_level: Math.round(runningStock),
      predicted_sales: day.predicted_demand
    };
  });

  // 2. Find Stockout Date
  const stockoutDay = burnData.find(d => d.stock_level <= 0);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Inventory Depletion Projection</h3>
        {stockoutDay ? (
          <span style={styles.badgeCritical}>
            ⚠️ Stockout Risk: {new Date(stockoutDay.date).toLocaleDateString()}
          </span>
        ) : (
          <span style={styles.badgeSafe}>
            ✅ Stock Safe for {forecastData.length} Days
          </span>
        )}
      </div>

      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <AreaChart data={burnData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="date" 
              tickFormatter={(str) => new Date(str).getDate()} 
              stroke="#94a3b8"
            />
            <YAxis stroke="#94a3b8" />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
            />
            {/* Reorder Point Line */}
            {lowStockThreshold && (
              <ReferenceLine y={lowStockThreshold} stroke="#ef4444" strokeDasharray="3 3" label="Reorder Point" />
            )}
            <Area 
              type="monotone" 
              dataKey="stock_level" 
              stroke="#2563eb" 
              fillOpacity={1} 
              fill="url(#colorStock)" 
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
    marginTop: '2rem'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem'
  },
  title: { margin: 0, color: '#1e293b', fontSize: '1.1rem', fontWeight: '700' },
  badgeCritical: {
    backgroundColor: '#fef2f2', color: '#dc2626', padding: '0.25rem 0.75rem',
    borderRadius: '99px', fontSize: '0.85rem', fontWeight: '600', border: '1px solid #fecaca'
  },
  badgeSafe: {
    backgroundColor: '#f0fdf4', color: '#16a34a', padding: '0.25rem 0.75rem',
    borderRadius: '99px', fontSize: '0.85rem', fontWeight: '600', border: '1px solid #bbf7d0'
  }
};

InventoryBurnChart.propTypes = {
  currentStock: PropTypes.number.isRequired,
  forecastData: PropTypes.array.isRequired,
  lowStockThreshold: PropTypes.number
};

export default InventoryBurnChart;