import React, { useEffect, useState } from 'react';
import { API_URL } from '../config/api';
import {
  PieChart, Pie, Cell, Legend,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, ResponsiveContainer
} from 'recharts';
import { Calendar } from 'lucide-react';

function DashboardPage() {
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [timeFilter, setTimeFilter] = useState('total'); // total, month, week, today

  // Filter expenses based on selected time period
  const getFilteredExpenses = () => {
    const now = new Date();
    
    switch(timeFilter) {
      case 'month':
        return expenses.filter(exp => {
          const date = new Date(exp.date);
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        });
      
      case 'week':
        const firstDayOfWeek = new Date(now);
        firstDayOfWeek.setDate(now.getDate() - now.getDay());
        firstDayOfWeek.setHours(0, 0, 0, 0);
        return expenses.filter(exp => {
          const date = new Date(exp.date);
          return date >= firstDayOfWeek;
        });
      
      case 'today':
        return expenses.filter(exp => {
          const date = new Date(exp.date);
          return (
            date.getDate() === now.getDate() &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear()
          );
        });
      
      default:
        return expenses;
    }
  };

  const filteredExpenses = getFilteredExpenses();

  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

  const thisMonthExpenses = expenses.filter(exp => {
    const now = new Date();
    const date = new Date(exp.date);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });

  const totalThisMonth = thisMonthExpenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

  const thisWeekExpenses = expenses.filter(exp => {
    const now = new Date();
    const date = new Date(exp.date);
    const firstDayOfWeek = new Date(now);
    firstDayOfWeek.setDate(now.getDate() - now.getDay());
    return date >= firstDayOfWeek;
  });

  const totalThisWeek = thisWeekExpenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

  const todayExpenses = expenses.filter(exp => {
    const now = new Date();
    const date = new Date(exp.date);
    return (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  });

  const totalToday = todayExpenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

  const allTimeTotal = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

  const percentChange = (current, previous) => {
    if (previous === 0) return current === 0 ? 0 : 100;
    return ((current - previous) / previous * 100).toFixed(2);
  };

  const changeThisMonth = percentChange(totalThisMonth, allTimeTotal - totalThisMonth);
  const changeThisWeek = percentChange(totalThisWeek, totalThisMonth - totalThisWeek);
  const changeToday = percentChange(totalToday, totalThisWeek - totalToday);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const res = await fetch(`${API_URL}/api/expense/getExpenses`, {
          method: 'GET',
          credentials: 'include'
        });
        const data = await res.json();
        const converted = data.expenses.map(exp => ({
          ...exp,
          date: new Date(exp.date)
        }));
        setExpenses(converted);
        const e = converted.sort((a, b) => b.date - a.date);
        setRecentExpenses(e.slice(0, 5));
      } catch (err) {
        console.error('Error fetching expenses:', err);
      }
    };
    fetchExpenses();
  }, []);

  const stats = [
    { label: 'Total Expenses', value: `₹${allTimeTotal.toLocaleString()}`, change: '+0%', color: 'blue' },
    { label: 'This Month', value: `₹${totalThisMonth.toLocaleString()}`, change: `${changeThisMonth > 0 ? '+' : ''}${changeThisMonth}%`, color: 'green' },
    { label: 'This Week', value: `₹${totalThisWeek.toLocaleString()}`, change: `${changeThisWeek > 0 ? '+' : ''}${changeThisWeek}%`, color: 'orange' },
    { label: 'Today', value: `₹${totalToday.toLocaleString()}`, change: `${changeToday > 0 ? '+' : ''}${changeToday}%`, color: 'purple' },
  ];

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#14B8A6'];

  const expensesByType = Object.values(
    filteredExpenses.reduce((acc, exp) => {
      acc[exp.expenseType] = acc[exp.expenseType] || { name: exp.expenseType, value: 0 };
      acc[exp.expenseType].value += parseFloat(exp.amount) || 0;
      return acc;
    }, {})
  );

  const spendingTrend = Object.values(
    filteredExpenses.reduce((acc, exp) => {
      const date = new Date(exp.date);
      const dateKey = date.toLocaleDateString('en-GB');
      acc[dateKey] = acc[dateKey] || { date: dateKey, amount: 0 };
      acc[dateKey].amount += parseFloat(exp.amount) || 0;
      return acc;
    }, {})
  ).sort((a, b) => {
    const dateA = a.date.split('/').reverse().join('-');
    const dateB = b.date.split('/').reverse().join('-');
    return new Date(dateA) - new Date(dateB);
  }).slice(-10); // Show last 10 data points

  const monthlyComparison = Object.values(
    filteredExpenses.reduce((acc, exp) => {
      const date = new Date(exp.date);
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      acc[key] = acc[key] || { month: key, total: 0 };
      acc[key].total += parseFloat(exp.amount) || 0;
      return acc;
    }, {})
  ).slice(-6); // Show last 6 months

  const paymentModeDistribution = Object.values(
    filteredExpenses.reduce((acc, exp) => {
      acc[exp.modeOfPayment] = acc[exp.modeOfPayment] || { mode: exp.modeOfPayment, total: 0 };
      acc[exp.modeOfPayment].total += parseFloat(exp.amount) || 0;
      return acc;
    }, {})
  );

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-semibold text-gray-800">{payload[0].payload.date || payload[0].payload.month || payload[0].payload.mode}</p>
          <p className="text-sm text-blue-600">₹{payload[0].value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null; // Don't show label if less than 5%
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-semibold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-6">
      {/* Time Filter Section */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-800">Dashboard View</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeFilter('total')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeFilter === 'total'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Total
            </button>
            <button
              onClick={() => setTimeFilter('month')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeFilter === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setTimeFilter('week')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeFilter === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setTimeFilter('today')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeFilter === 'today'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Today
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">{stat.label}</p>
              <span className={`text-xs px-2 py-1 rounded-full ${
                stat.change.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expenses by Type - Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Expenses by Type</h3>
          {expensesByType.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expensesByType}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  labelLine={false}
                  label={renderCustomLabel}
                >
                  {expensesByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry) => `${value}: ₹${entry.payload.value.toLocaleString()}`}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </div>

        {/* Spending Trend - Line Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Spending Trend</h3>
          {spendingTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={spendingTrend} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#4F46E5" 
                  strokeWidth={3}
                  dot={{ fill: '#4F46E5', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </div>

        {/* Monthly Comparison - Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Monthly Comparison</h3>
          {monthlyComparison.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyComparison} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" fill="#F59E0B" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </div>

        {/* Payment Mode Distribution - Horizontal Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Payment Mode Distribution</h3>
          {paymentModeDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={paymentModeDistribution} 
                layout="vertical"
                margin={{ top: 5, right: 30, bottom: 5, left: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis 
                  dataKey="mode" 
                  type="category" 
                  tick={{ fontSize: 12 }}
                  width={80}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" fill="#8B5CF6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Recent Expenses Table */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Recent Expenses</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Mode</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Branch</th>
              </tr>
            </thead>
            <tbody>
              {recentExpenses.length > 0 ? (
                recentExpenses.map((expense, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600">{new Date(expense.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-sm text-gray-800">{expense.expenseType}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-800">₹{expense.amount}</td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                        {expense.modeOfPayment}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{expense.branch}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">
                    No recent expenses
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;