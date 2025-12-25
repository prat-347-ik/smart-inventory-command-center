import PropTypes from 'prop-types';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const SalesForecastChart = ({ data, sku }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%', 
        color: '#94a3b8' 
      }}>
        No forecast data available
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', minHeight: 400 }}>
      <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#1e293b' }}>
        Demand Forecast: <span style={{ color: '#2563eb' }}>{sku}</span>
      </h3>
      
      <ResponsiveContainer width="100%" height="90%">
        <ComposedChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          
          <XAxis 
            dataKey="date" 
            tickFormatter={(str) => {
              const date = new Date(str);
              return `${date.getMonth() + 1}/${date.getDate()}`;
            }}
            stroke="#64748b"
            tick={{ fontSize: 12 }}
          />
          
          <YAxis 
            label={{ 
              value: 'Units', 
              angle: -90, 
              position: 'insideLeft',
              style: { fill: '#64748b' }
            }}
            stroke="#64748b"
            tick={{ fontSize: 12 }}
          />
          
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              borderRadius: '8px', 
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' 
            }}
            labelFormatter={(label) => new Date(label).toDateString()}
            formatter={(value, name) => [
              value.toFixed(1), 
              name === 'predicted_demand' ? 'Predicted Units' : name
            ]}
          />
          
          <Legend verticalAlign="top" height={36}/>

          {/* CONFIDENCE INTERVAL (Shaded Area)
            We use a stacked area trick or just a simple area if 'lower_bound' is available.
            Since our backend provides specific upper/lower bounds, we can just draw 
            the 'upper_bound' area with a customized baseValue if supported, 
            or simpler: Draw the Area for Upper Bound and hide the Lower Bound with a white area?
            
            BETTER APPROACH FOR RECHARTS:
            Use 'range' area if possible, but standard Recharts requires data processing for ranges.
            
            MVP VISUALIZATION TRICK:
            Draw the 'upper_bound' in light blue.
            Draw the 'lower_bound' in WHITE (to mask the bottom).
            This creates the "Band" effect effectively on a white background.
          */}
          
          <Area 
            type="monotone" 
            dataKey="upper_bound" 
            name="Confidence Range (High)"
            stroke="none" 
            fill="#dbeafe" // Light Blue
            fillOpacity={0.6} 
            isAnimationActive={false}
          />
          
          <Area 
            type="monotone" 
            dataKey="lower_bound" 
            name="Confidence Range (Low)" 
            stroke="none" 
            fill="#ffffff" // White (Mask)
            fillOpacity={1} 
            isAnimationActive={false}
          />

          {/* MAIN FORECAST LINE */}
          <Line 
            type="monotone" 
            dataKey="predicted_demand" 
            name="Predicted Demand" 
            stroke="#2563eb" // Blue-600
            strokeWidth={3} 
            dot={{ r: 4, fill: '#2563eb', strokeWidth: 0 }}
            activeDot={{ r: 7, strokeWidth: 0 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

SalesForecastChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      predicted_demand: PropTypes.number.isRequired,
      // Optional because older API versions might not send bounds
      upper_bound: PropTypes.number,
      lower_bound: PropTypes.number,
    })
  ),
  sku: PropTypes.string
};

export default SalesForecastChart;