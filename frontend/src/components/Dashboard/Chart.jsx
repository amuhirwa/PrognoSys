import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import './Chart.css';

const Chart = ({ data }) => {
  const [timeRange, setTimeRange] = useState('weekly');
  const [chartType, setChartType] = useState('area');

  // Sample data - replace with your actual data
  const chartData = {
    weekly: [
      { name: 'Mon', revenue: 4000, sales: 2400, expenses: 2400 },
      { name: 'Tue', revenue: 3000, sales: 1398, expenses: 2210 },
      { name: 'Wed', revenue: 2000, sales: 9800, expenses: 2290 },
      { name: 'Thu', revenue: 2780, sales: 3908, expenses: 2000 },
      { name: 'Fri', revenue: 1890, sales: 4800, expenses: 2181 },
      { name: 'Sat', revenue: 2390, sales: 3800, expenses: 2500 },
      { name: 'Sun', revenue: 3490, sales: 4300, expenses: 2100 },
    ],
    monthly: [
      { name: 'Jan', revenue: 14000, sales: 12400, expenses: 12400 },
      { name: 'Feb', revenue: 13000, sales: 11398, expenses: 12210 },
      { name: 'Mar', revenue: 12000, sales: 19800, expenses: 12290 },
      { name: 'Apr', revenue: 12780, sales: 13908, expenses: 12000 },
      { name: 'May', revenue: 11890, sales: 14800, expenses: 12181 },
      { name: 'Jun', revenue: 12390, sales: 13800, expenses: 12500 },
    ],
    yearly: [
      { name: '2019', revenue: 140000, sales: 122400, expenses: 122400 },
      { name: '2020', revenue: 130000, sales: 111398, expenses: 122210 },
      { name: '2021', revenue: 120000, sales: 198000, expenses: 122290 },
      { name: '2022', revenue: 127800, sales: 139080, expenses: 120000 },
      { name: '2023', revenue: 118900, sales: 148000, expenses: 121810 },
    ],
  };

  const renderChart = () => {
    const currentData = data || chartData[timeRange];

    if (chartType === 'area') {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart
            data={currentData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip 
              contentStyle={{ 
                background: '#fff',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
              formatter={(value) => [`$${value}`, '']}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#8884d8"
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#82ca9d"
              fillOpacity={1}
              fill="url(#colorSales)"
            />
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={currentData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip
            contentStyle={{ 
              background: '#fff',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
            formatter={(value) => [`$${value}`, '']}
          />
          <Legend />
          <Bar dataKey="revenue" fill="#8884d8" radius={[4, 4, 0, 0]} />
          <Bar dataKey="sales" fill="#82ca9d" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h2>Revenue & Sales Overview</h2>
        <div className="chart-controls">
          <div className="chart-type-toggle">
            <button
              className={`toggle-btn ${chartType === 'area' ? 'active' : ''}`}
              onClick={() => setChartType('area')}
            >
              Area
            </button>
            <button
              className={`toggle-btn ${chartType === 'bar' ? 'active' : ''}`}
              onClick={() => setChartType('bar')}
            >
              Bar
            </button>
          </div>
          <div className="time-range-selector">
            <button
              className={`range-btn ${timeRange === 'weekly' ? 'active' : ''}`}
              onClick={() => setTimeRange('weekly')}
            >
              Week
            </button>
            <button
              className={`range-btn ${timeRange === 'monthly' ? 'active' : ''}`}
              onClick={() => setTimeRange('monthly')}
            >
              Month
            </button>
            <button
              className={`range-btn ${timeRange === 'yearly' ? 'active' : ''}`}
              onClick={() => setTimeRange('yearly')}
            >
              Year
            </button>
          </div>
        </div>
      </div>
      <div className="chart-content">
        {renderChart()}
      </div>
    </div>
  );
};

export default Chart; 