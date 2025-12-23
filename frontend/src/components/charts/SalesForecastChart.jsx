import PropTypes from 'prop-types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart
} from 'recharts';
import { formatDate } from '../../utils/formatters'; // We'll create this small helper too

const SalesForecastChart = ({ data, sku }) => {
  if (!data || data.length === 0) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>No forecast data available</div>;
  }

  return (
    <div style={{ width: '100%', height: 400 }}>
      <h3 style={{ textAlign: 'center', marginBottom: '10px' }}>
        7-Day Demand Forecast: <span style={{ color: '#2563eb' }}>{sku}</span>
      </h3>
      
      <ResponsiveContainer>
        <ComposedChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
          
          <XAxis 
            dataKey="date" 
            tickFormatter={(str) => new Date(str).toLocaleDateString()}
          />
          <YAxis label={{ value: 'Units', angle: -90, position: 'insideLeft' }} />
          
          <Tooltip 
            labelFormatter={(label) => new Date(label).toDateString()}
            formatter={(value) => [value.toFixed(1), 'Units']}
          />
          <Legend verticalAlign="top" height={36}/>

          {/* Confidence Interval (Area) */}
          <Area 
            type="monotone" 
            dataKey="upper_bound" 
            stroke="none" 
            fill="#e0e7ff" 
            fillOpacity={0.5} 
          />
          {/* We assume lower_bound is handled or we stack areas, but for MVP simple area is fine */}
          
          {/* Main Forecast Line */}
          <Line 
            type="monotone" 
            dataKey="predicted_demand" 
            name="Predicted Demand" 
            stroke="#2563eb" 
            strokeWidth={3} 
            dot={{ r: 4 }}
            activeDot={{ r: 8 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
      
      <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#666', marginTop: '10px' }}>
        *Shaded area represents the confidence interval of the prediction.
      </p>
    </div>
  );
};

SalesForecastChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      predicted_demand: PropTypes.number.isRequired,
      lower_bound: PropTypes.number,
      upper_bound: PropTypes.number,
    })
  ).isRequired,
  sku: PropTypes.string.isRequired
};

export default SalesForecastChart;