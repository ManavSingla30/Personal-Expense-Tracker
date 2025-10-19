import React, { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { PieChart, Pie, Cell, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

export default function ReportsPage() {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [filtersActive, setFiltersActive] = useState(false);
  const [filters, setFilters] = useState({
    selectedBranch: "",
    selectedType: "",
    selectedMode: "",
    dateFrom: "",
    dateTo: "",
  });
  
  const colors = [
    "#4F46E5", 
    "#10B981", 
    "#F59E0B", 
    "#EF4444", 
    "#8B5CF6", 
    "#14B8A6", 
    "#EC4899", 
  ];

  const handleExportExcel = () => {
    const columnHeaders = [
      "Date",
      "Branch",
      "Type",
      "Amount",
      "Mode",
      "Payment To",
      "Vehicle",
      "Remarks",
    ];

    const dataToExport = filteredExpenses.map((exp) => [
      exp.date.toLocaleDateString(),
      exp.branch,
      exp.expenseType,
      exp.amount,
      exp.modeOfPayment,
      exp.paymentTo,
      exp.vehicleNumber || "-",
      exp.remarks || "-",
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([columnHeaders, ...dataToExport]);

    worksheet["!cols"] = [
      { wch: 12 },
      { wch: 15 },
      { wch: 15 },
      { wch: 10 },
      { wch: 12 },
      { wch: 20 },
      { wch: 15 },
      { wch: 40 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    saveAs(data, `Expense_Report_${new Date().toLocaleDateString()}.xlsx`);
  };

  const handleExportPdf = () => {
    const doc = new jsPDF();
    const tableColumns = [
      "Date",
      "Branch",
      "Type",
      "Amount",
      "Mode",
      "Vehicle",
      "Payment To",
      "Remarks",
    ];
    const tableRows = [];

    filteredExpenses.forEach((exp) => {
      tableRows.push([
        exp.date.toLocaleDateString(),
        exp.branch,
        exp.expenseType,
        `₹${exp.amount.toLocaleString("en-IN")}`,
        exp.modeOfPayment,
        exp.vehicleNumber || "-",
        exp.paymentTo,
        exp.remarks || "-",
      ]);
    });

    doc.setFontSize(18);
    doc.text("Expense Report", 14, 22);

    autoTable(doc, {
      head: [tableColumns],
      body: tableRows,
      startY: 30,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 2.5, overflow: "linebreak" },
      headStyles: {
        fillColor: [34, 139, 34],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 18 },
        1: { cellWidth: 20 },
        2: { cellWidth: 20 },
        3: { cellWidth: 20, halign: "right" },
        4: { cellWidth: 15 },
        5: { cellWidth: 20 },
        6: { cellWidth: 22 },
        7: { cellWidth: 35 },
      },
      didDrawPage: (data) => {
        const totalAmount = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        const totalStr = `Total Expenses: ₹${totalAmount.toLocaleString("en-IN")}`;
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(totalStr, data.settings.margin.left, doc.internal.pageSize.height - 10);
      },
    });

    doc.save(`Expense_Report_${new Date().toLocaleDateString()}.pdf`);
  };

  useEffect(() => {
    async function fetchExpenses() {
      const res = await fetch("http://localhost:3000/api/expense/getExpenses", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      const converted = data.expenses.map((exp) => ({
        ...exp,
        date: new Date(exp.date),
      }));
      setExpenses(converted);
      setFilteredExpenses(converted);
    }
    fetchExpenses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    let filtered = [...expenses];
    if (filters.selectedBranch)
      filtered = filtered.filter((exp) => exp.branch === filters.selectedBranch);
    if (filters.selectedType)
      filtered = filtered.filter((exp) => exp.expenseType === filters.selectedType);
    if (filters.selectedMode)
      filtered = filtered.filter((exp) => exp.modeOfPayment === filters.selectedMode);
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter((exp) => exp.date >= fromDate);
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((exp) => exp.date <= toDate);
    }
    setFilteredExpenses(filtered);
    setCurrentPage(1);
    setFiltersActive(true);
  };

  const handleClearFilters = () => {
    setFilters({
      selectedBranch: "",
      selectedType: "",
      selectedMode: "",
      dateFrom: "",
      dateTo: "",
    });
    setFilteredExpenses(expenses);
    setCurrentPage(1);
    setFiltersActive(false);
  };

  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentExpenses = filteredExpenses.slice(startIndex, startIndex + itemsPerPage);
  const handlePrevious = () => currentPage > 1 && setCurrentPage((p) => p - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage((p) => p + 1);

  const totalExpenseAmount = filteredExpenses.reduce((acc, exp) => acc + exp.amount, 0);
  const totalTransactions = filteredExpenses.length;
  const averageExpense = totalTransactions > 0 ? totalExpenseAmount / totalTransactions : 0;
  const highestExpense =
    totalTransactions > 0 ? Math.max(...filteredExpenses.map((exp) => exp.amount)) : 0;

  const pieData = Object.entries(
    filteredExpenses.reduce((acc, exp) => {
      acc[exp.expenseType] = (acc[exp.expenseType] || 0) + exp.amount;
      return acc;
    }, {})
  ).map(([type, amount]) => ({ name: type, value: amount }));

  const sortedExpenses = [...filteredExpenses].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  const dailyTotals = sortedExpenses.reduce((acc, exp) => {
    const dateString = exp.date.toLocaleDateString(); 
    const currentTotal = acc.get(dateString) || 0;
    acc.set(dateString, currentTotal + exp.amount);
    return acc;
  }, new Map());
  
  const lineData = Array.from(dailyTotals, ([date, total]) => ({ date, total })).slice(-15);

  const branches = [...new Set(expenses.map((exp) => exp.branch))];
  const types = [...new Set(expenses.map((exp) => exp.expenseType))];
  const modes = [...new Set(expenses.map((exp) => exp.modeOfPayment))];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-semibold text-gray-800">{payload[0].payload.name || payload[0].payload.date}</p>
          <p className="text-sm text-blue-600 font-semibold">₹{payload[0].value.toLocaleString('en-IN')}</p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Expense Reports</h2>
          <div className="flex items-center gap-3">
            <button
              className="inline-flex items-center px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
              onClick={handleExportExcel}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </button>
            <button
              className="inline-flex items-center px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm"
              onClick={handleExportPdf}
            >
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
              <input
                type="date"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <input
                type="date"
                name="dateTo"
                value={filters.dateTo}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
              <select
                name="selectedBranch"
                value={filters.selectedBranch}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white"
              >
                <option value="">All Branches</option>
                {branches.map((branch, idx) => (
                  <option key={idx} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expense Type</label>
              <select
                name="selectedType"
                value={filters.selectedType}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white"
              >
                <option value="">All Types</option>
                {types.map((type, idx) => (
                  <option key={idx} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
              <select
                name="selectedMode"
                value={filters.selectedMode}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white"
              >
                <option value="">All Modes</option>
                {modes.map((mode, idx) => (
                  <option key={idx} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={handleClearFilters}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
              disabled={!filtersActive}
            >
              Reset
            </button>
            <button
              onClick={handleSearch}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <p className="text-sm opacity-90 mb-1 font-medium">Total Expenses</p>
          <p className="text-3xl font-bold mb-1">₹{totalExpenseAmount.toLocaleString("en-IN")}</p>
          <p className="text-xs opacity-80">From selected period</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <p className="text-sm opacity-90 mb-1 font-medium">Average Expense</p>
          <p className="text-3xl font-bold mb-1">
            ₹{averageExpense.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs opacity-80">Per transaction</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <p className="text-sm opacity-90 mb-1 font-medium">Total Transactions</p>
          <p className="text-3xl font-bold mb-1">{totalTransactions}</p>
          <p className="text-xs opacity-80">In selected period</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <p className="text-sm opacity-90 mb-1 font-medium">Highest Expense</p>
          <p className="text-3xl font-bold mb-1">
            ₹{highestExpense.toLocaleString("en-IN")}
          </p>
          <p className="text-xs opacity-80">Single transaction</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Expense Distribution by Type</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  labelLine={false}
                  label={renderCustomLabel}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry) => {
                    const percent = ((entry.payload.value / totalExpenseAmount) * 100).toFixed(1);
                    return `${value} (${percent}%)`;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[320px] flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">No data available</p>
            </div>
          )}
        </div>

        {/* Line Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Daily Expense Trend</h3>
          {lineData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart 
                data={lineData} 
                margin={{ top: 20, right: 30, left: 10, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: "#3b82f6", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[320px] flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">No data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Expense Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Date</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Branch</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Type</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Amount</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Mode</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Payment To</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Vehicle</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {currentExpenses.length > 0 ? (
                currentExpenses.map((expense, idx) => (
                  <tr
                    key={expense._id || idx}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {expense.date.toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-800 font-medium">{expense.branch}</td>
                    <td className="py-4 px-4 text-sm text-gray-800">{expense.expenseType}</td>
                    <td className="py-4 px-4 text-sm font-semibold text-gray-800">
                      ₹{expense.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-block px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-medium">
                        {expense.modeOfPayment}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">{expense.paymentTo}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {expense.vehicleNumber || "-"}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600 max-w-xs truncate" title={expense.remarks}>
                      {expense.remarks || "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-gray-500">
                    No expenses found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredExpenses.length > itemsPerPage && (
          <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2 sm:mb-0">
              Showing{" "}
              <span className="font-semibold">
                {startIndex + 1}-
                {Math.min(startIndex + itemsPerPage, filteredExpenses.length)}
              </span>{" "}
              of <span className="font-semibold">{filteredExpenses.length}</span> expenses
            </p>
            <div className="flex items-center gap-2">
              <button
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={handlePrevious}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="text-sm text-gray-600 px-3">
                Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
              </span>
              <button
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={handleNext}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}






