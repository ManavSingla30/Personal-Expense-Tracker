import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Edit, Trash2, X, AlertTriangle } from 'lucide-react';

export default function ExpenseListPage() {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const navigate = useNavigate();

  // Filter states
  const [searchText, setSearchText] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedMode, setSelectedMode] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Track if filters are active
  const [filtersActive, setFiltersActive] = useState(false);

  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  useEffect(() => {
    async function fetchExpenses() {
      const res = await fetch('http://localhost:3000/api/expense/getExpenses', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await res.json();
      const converted = data.expenses.map(exp => ({
        ...exp,
        date: new Date(exp.date)
      }));
      console.log(converted);
      setExpenses(converted);
      setFilteredExpenses(converted);
    }
    fetchExpenses();
  }, []);

  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentExpenses = filteredExpenses.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleNewExpense = () => {
    navigate('/add-expense');
  };

  const handleView = (expense) => {
    setSelectedExpense(expense);
    setViewModalOpen(true);
  };

  const handleEdit = (expense) => {
    navigate('/edit-expense', { state: { expense } });
  };

  const handleDeleteClick = (expense) => {
    setSelectedExpense(expense);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/expense/deleteExpense/${selectedExpense._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (res.ok) {
        // Remove from state
        const updatedExpenses = expenses.filter(exp => exp._id !== selectedExpense._id);
        setExpenses(updatedExpenses);
        setFilteredExpenses(updatedExpenses);
        setDeleteModalOpen(false);
        setSelectedExpense(null);
      } else {
        alert('Failed to delete expense');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Error deleting expense');
    }
  };

  const handleSearch = () => {
    let filtered = [...expenses];

    // Search by Payment To
    if (searchText.trim()) {
      filtered = filtered.filter(exp =>
        exp.paymentTo.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filter by Branch
    if (selectedBranch) {
      filtered = filtered.filter(exp => exp.branch === selectedBranch);
    }

    // Filter by Type
    if (selectedType) {
      filtered = filtered.filter(exp => exp.expenseType === selectedType);
    }

    // Filter by Mode of Payment
    if (selectedMode) {
      filtered = filtered.filter(exp => exp.modeOfPayment === selectedMode);
    }

    // Filter by Date Range
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filtered = filtered.filter(exp => exp.date >= fromDate);
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(exp => exp.date <= toDate);
    }

    setFilteredExpenses(filtered);
    setCurrentPage(1);
    setFiltersActive(true);
  };

  const handleClearFilters = () => {
    setSearchText('');
    setSelectedBranch('');
    setSelectedType('');
    setSelectedMode('');
    setDateFrom('');
    setDateTo('');
    setFilteredExpenses(expenses);
    setCurrentPage(1);
    setFiltersActive(false);
  };

  // Get unique values for dropdowns
  const branches = [...new Set(expenses.map(exp => exp.branch))];
  const types = [...new Set(expenses.map(exp => exp.expenseType))];
  const modes = [...new Set(expenses.map(exp => exp.modeOfPayment))];

  return (
    <div className="space-y-6">
      {/* Header with Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Expense List</h2>
          <button
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={handleNewExpense}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Expense
          </button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Row 1: Search, Branch, Type */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Search Input */}
            <div className="md:col-span-6 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Payment To..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Branch Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white"
              >
                <option value="">All Branches</option>
                {branches.map((branch, idx) => (
                  <option key={idx} value={branch}>{branch}</option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white"
              >
                <option value="">All Types</option>
                {types.map((type, idx) => (
                  <option key={idx} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Mode, Date Range, Search Button */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Mode of Payment */}
            <div className="md:col-span-3">
              <select
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white"
              >
                <option value="">All Payment Modes</option>
                {modes.map((mode, idx) => (
                  <option key={idx} value={mode}>{mode}</option>
                ))}
              </select>
            </div>

            {/* Date From */}
            <div className="md:col-span-4">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="Date From"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Date To */}
            <div className="md:col-span-4">
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="Date To"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Search Button */}
            <div className="md:col-span-1 flex gap-2">
              <button
                onClick={handleSearch}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center font-medium"
              >
                <Search className="w-5 h-5" />
              </button>
              {filtersActive && (
                <button
                  onClick={handleClearFilters}
                  className="px-3 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors inline-flex items-center justify-center"
                  title="Clear Filters"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {filtersActive && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-blue-700">
                <span className="font-semibold">Filters Active:</span> Showing {filteredExpenses.length} of {expenses.length} expenses
              </p>
            </div>
          </div>
        )}
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
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentExpenses.length > 0 ? (
                currentExpenses.map((expense, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 text-sm text-gray-600">{expense.date.toLocaleDateString()}</td>
                    <td className="py-4 px-4 text-sm text-gray-800">{expense.branch}</td>
                    <td className="py-4 px-4 text-sm text-gray-800">{expense.expenseType}</td>
                    <td className="py-4 px-4 text-sm font-semibold text-gray-800">{expense.amount}</td>
                    <td className="py-4 px-4">
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                        {expense.modeOfPayment}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">{expense.paymentTo}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{expense.vehicleNumber}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{expense.remarks}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          className="p-1 hover:bg-blue-50 rounded text-blue-600" 
                          title="View"
                          onClick={() => handleView(expense)}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-1 hover:bg-green-50 rounded text-green-600" 
                          title="Edit"
                          onClick={() => handleEdit(expense)}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-1 hover:bg-red-50 rounded text-red-600" 
                          title="Delete"
                          onClick={() => handleDeleteClick(expense)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-gray-500">
                    No expenses found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {filteredExpenses.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2 sm:mb-0">
              Showing{' '}
              <span className="font-semibold">
                {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredExpenses.length)}
              </span>{' '}
              of <span className="font-semibold">{filteredExpenses.length}</span> expenses
            </p>

            <div className="flex items-center space-x-2">
              <button
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 text-sm disabled:opacity-50"
                onClick={handlePrevious}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded text-sm ${
                    currentPage === i + 1
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 text-sm disabled:opacity-50"
                onClick={handleNext}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      {viewModalOpen && selectedExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">Expense Details</h3>
                <button
                  onClick={() => setViewModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Date</label>
                  <p className="text-gray-800 font-semibold">{selectedExpense.date.toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Branch</label>
                  <p className="text-gray-800 font-semibold">{selectedExpense.branch}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Expense Type</label>
                  <p className="text-gray-800 font-semibold">{selectedExpense.expenseType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Amount</label>
                  <p className="text-green-600 font-bold text-lg">₹{selectedExpense.amount.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Mode of Payment</label>
                  <span className="inline-block px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-700 font-medium">
                    {selectedExpense.modeOfPayment}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Payment To</label>
                  <p className="text-gray-800 font-semibold">{selectedExpense.paymentTo}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Vehicle Number</label>
                  <p className="text-gray-800 font-semibold">{selectedExpense.vehicleNumber || '-'}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Remarks</label>
                <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{selectedExpense.remarks || 'No remarks'}</p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setViewModalOpen(false);
                  handleEdit(selectedExpense);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Edit Expense
              </button>
              <button
                onClick={() => setViewModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && selectedExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Delete Expense</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-600 mb-2">You are about to delete:</p>
                <p className="font-semibold text-gray-800">{selectedExpense.expenseType} - ₹{selectedExpense.amount.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Payment to: {selectedExpense.paymentTo}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setSelectedExpense(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}