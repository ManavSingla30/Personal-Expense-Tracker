import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Save, X } from 'lucide-react';

export default function EditExpensePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const expense = location.state?.expense;

  // If no expense data, redirect back
  if (!expense) {
    navigate('/expense-list');
    return null;
  }

  const [formData, setFormData] = useState({
    date: expense.date.toISOString().split('T')[0], // Convert to YYYY-MM-DD format
    branch: expense.branch,
    expenseType: expense.expenseType,
    amount: expense.amount,
    modeOfPayment: expense.modeOfPayment,
    paymentTo: expense.paymentTo,
    vehicleNumber: expense.vehicleNumber || '',
    remarks: expense.remarks || ''
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/expense/updateExpense/${expense._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        alert('Expense updated successfully!');
        navigate('/expense-list');
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to update expense');
      }
    } catch (error) {
      console.error('Error updating expense:', error);
      alert('Error updating expense');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/expense-list');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Edit Expense</h2>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Branch */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Branch <span className="text-red-500">*</span>
              </label>
              <select
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">Select Branch</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Chennai">Chennai</option>
              </select>
            </div>

            {/* Expense Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expense Type <span className="text-red-500">*</span>
              </label>
              <select
                name="expenseType"
                value={formData.expenseType}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">Select Type</option>
                <option value="Logistic Cost">Logistic Cost</option>
                <option value="Transportation">Transportation</option>
                <option value="Staff Welfare">Staff Welfare</option>
                <option value="Labour">Labour</option>
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Mode of Payment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mode of Payment <span className="text-red-500">*</span>
              </label>
              <select
                name="modeOfPayment"
                value={formData.modeOfPayment}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">Select Mode</option>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Online">Online</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>

            {/* Payment To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment To <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="paymentTo"
                value={formData.paymentTo}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Vehicle Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Number
              </label>
              <input
                type="text"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remarks
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5 mr-2" />
              {loading ? 'Updating...' : 'Update Expense'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
