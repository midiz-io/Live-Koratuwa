import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Charts = ({ boxStats, languageStats }) => {
  // Prepare data for bar chart (top 10 boxes)
  const barData = boxStats?.slice(0, 10).map(box => ({
    name: `Box ${box.number}`,
    views: box.views,
    fullName: box.name
  })) || [];

  // Prepare data for pie chart (language distribution)
  const pieData = languageStats?.map(lang => ({
    name: lang.language.toUpperCase(),
    value: lang.count,
    percentage: Number(lang.percentage.toFixed(2))
  })) || [];

  const COLORS = ['#22c55e', '#16a34a', '#15803d', '#166534', '#14532d', '#84cc16', '#65a30d', '#4d7c0f'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      {/* Bar Chart - Box Views */}
      <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
        <h3 className="text-base font-semibold text-gray-800 mb-3">Top Boxes by Views</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip 
                formatter={(value, name, props) => [
                  `${value} views`,
                  props.payload.fullName
                ]}
                labelStyle={{ color: '#374151' }}
                contentStyle={{ fontSize: '12px' }}
              />
              <Bar dataKey="views" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart - Language Distribution */}
      <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
        <h3 className="text-base font-semibold text-gray-800 mb-3">Language Distribution</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} (${percentage}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name, props) => [
                  `${value} views (${props.payload.percentage}%)`,
                  'Views'
                ]}
                contentStyle={{ fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Charts;
