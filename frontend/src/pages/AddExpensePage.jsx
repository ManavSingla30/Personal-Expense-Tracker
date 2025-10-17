import React, { useState } from 'react';

export default function AddExpensePage() {
  const [formData, setFormData] = useState({
    date: '',
    branch: '',
    expenseType: '',
    amount: '',
    modeOfPayment: '',
    paymentTo: '',
    vehicleNumber: '',
    remarks: '',
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleReset = () => {
    setFormData({
      date: '',
      branch: '',
      expenseType: '',
      amount: '',
      modeOfPayment: '',
      paymentTo: '',
      vehicleNumber: '',
      remarks: '',
    });
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    async function submitData() {
      try {
        const res = await fetch('https://personal-expense-tracker-psi.vercel.app/api/expense/addExpense', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          setSuccessMessage('Expense added successfully!');
          setErrorMessage('');
          handleReset();

          setTimeout(() => setSuccessMessage(''), 3000);
        } else {
          const errData = await res.json();
          setErrorMessage(errData.message || ' Failed to add expense.');
          setTimeout(() => setErrorMessage(''), 3000);
        }
      } catch (err) {
        console.error('Error adding expense:', err);
        setErrorMessage(' Network error. Please try again.');
        setTimeout(() => setErrorMessage(''), 3000);
      }
    }

    submitData();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Expense</h2>

        {/* ✅ Success / Error messages */}
        {successMessage && (
          <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-800 border border-green-300 text-center font-medium">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-800 border border-red-300 text-center font-medium">
            {errorMessage}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                value={formData.date}
                onChange={handleChange}
                name="date"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Branch <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                value={formData.branch}
                onChange={handleChange}
                name="branch"
                required
              >
                <option value="">Select Branch</option>
                <option>Mumbai</option>
                <option>Delhi</option>
                <option>Bangalore</option>
                <option>Chennai</option>
                <option>Kolkata</option>
              </select>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expense Type <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                value={formData.expenseType}
                onChange={handleChange}
                name="expenseType"
                required
              >
                <option value="">Select Type</option>
                <option>Logistic Cost</option>
                <option>Staff Welfare</option>
                <option>Labour</option>
                <option>Transportation</option>
                <option>Miscellaneous</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-gray-500">₹</span>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  value={formData.amount}
                  onChange={handleChange}
                  name="amount"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mode of Payment <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                value={formData.modeOfPayment}
                onChange={handleChange}
                name="modeOfPayment"
                required
              >
                <option value="">Select Mode</option>
                <option>Cash</option>
                <option>Online</option>
                <option>UPI</option>
                <option>Cheque</option>
                <option>Card</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment To
              </label>
              <input
                type="text"
                placeholder="Vendor/Person name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                value={formData.paymentTo}
                onChange={handleChange}
                name="paymentTo"
              />
            </div>
          </div>

          {/* Row 4 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Number (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., MH-01-AB-1234"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              value={formData.vehicleNumber}
              onChange={handleChange}
              name="vehicleNumber"
            />
          </div>

          {/* Row 5 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remarks
            </label>
            <textarea
              rows="4"
              placeholder="Add any additional notes..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              value={formData.remarks}
              onChange={handleChange}
              name="remarks"
            ></textarea>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-[1.02] shadow-lg"
            >
              Add Expense
            </button>
            <button
              type="button"
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              onClick={handleReset}
            >
              Reset Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
