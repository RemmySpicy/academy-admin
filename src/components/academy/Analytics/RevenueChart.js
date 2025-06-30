import React from 'react';
import styled from 'styled-components';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

const ChartContainer = styled.div`
  background-color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow);
  padding: 24px;
  height: 400px;
`;

const ChartHeader = styled.div`
  margin-bottom: 24px;
  
  h2 {
    font-size: 1.25rem;
    margin: 0 0 8px 0;
  }
  
  p {
    color: var(--gray-600);
    font-size: 14px;
    margin: 0;
  }
`;

// Sample data for the chart
const data = [
  { month: 'Jan', revenue: 12000, expenses: 8000, profit: 4000 },
  { month: 'Feb', revenue: 14000, expenses: 9000, profit: 5000 },
  { month: 'Mar', revenue: 15000, expenses: 8500, profit: 6500 },
  { month: 'Apr', revenue: 16500, expenses: 9200, profit: 7300 },
  { month: 'May', revenue: 18000, expenses: 9800, profit: 8200 },
  { month: 'Jun', revenue: 19500, expenses: 10500, profit: 9000 },
  { month: 'Jul', revenue: 22000, expenses: 11000, profit: 11000 },
  { month: 'Aug', revenue: 24000, expenses: 12000, profit: 12000 },
  { month: 'Sep', revenue: 21000, expenses: 11500, profit: 9500 },
  { month: 'Oct', revenue: 20000, expenses: 11000, profit: 9000 },
  { month: 'Nov', revenue: 22500, expenses: 12500, profit: 10000 },
  { month: 'Dec', revenue: 25000, expenses: 13000, profit: 12000 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ 
        backgroundColor: '#fff', 
        padding: '10px', 
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <p style={{ margin: '0 0 5px', fontWeight: 'bold' }}>{`${label}`}</p>
        <p style={{ margin: '0', color: '#6c5ce7' }}>
          {`Revenue: $${payload[0].value.toLocaleString()}`}
        </p>
        <p style={{ margin: '0', color: '#e53e3e' }}>
          {`Expenses: $${payload[1].value.toLocaleString()}`}
        </p>
        <p style={{ margin: '0', color: '#38b2ac' }}>
          {`Profit: $${payload[2].value.toLocaleString()}`}
        </p>
      </div>
    );
  }
  return null;
};

const RevenueChart = () => {
  return (
    <ChartContainer>
      <ChartHeader>
        <h2>Revenue Overview</h2>
        <p>Monthly revenue, expenses, and profit for the current year</p>
      </ChartHeader>
      
      <ResponsiveContainer width="100%" height="80%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} />
          <YAxis 
            tickFormatter={(value) => `$${value/1000}k`} 
            tickLine={false} 
            axisLine={false} 
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" height={36} />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            stackId="1" 
            stroke="#6c5ce7" 
            fill="#6c5ce7" 
            fillOpacity={0.6} 
            name="Revenue"
          />
          <Area 
            type="monotone" 
            dataKey="expenses" 
            stackId="2" 
            stroke="#e53e3e" 
            fill="#e53e3e" 
            fillOpacity={0.4} 
            name="Expenses"
          />
          <Area 
            type="monotone" 
            dataKey="profit" 
            stackId="3" 
            stroke="#38b2ac" 
            fill="#38b2ac" 
            fillOpacity={0.5} 
            name="Profit"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default RevenueChart; 