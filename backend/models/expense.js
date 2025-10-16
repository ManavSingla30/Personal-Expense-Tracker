const mongoose = require('mongoose');
const User = require('./user');

const expenseSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    date: {
        type: Date, 
        required: [true, 'Date is required'],
        default: Date.now,
        index: true
    },
    branch: {
        type: String,
        required: [true, 'Branch is required'],
        index: true
    },
    expenseType: {
        type: String,
        required: [true, 'Expense type is required'],
        enum: ['Logistic Cost',
            'Staff Welfare',
            'Labour',
            'Transportation',
            'Miscellaneous'
            ],
        index: true
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0, 'Amount cannot be negative']
    },
    modeOfPayment: {
        type: String,
        required: true,
        enum: ['Cash', 'Online', 'UPI', 'Cheque', 'Card'],
        index: true
    },
    paymentTo: {
        type: String,
        trim: true
    },
    vehicleNumber: {
        type: String,
        trim: true,
        uppercase: true
    },
    remarks: {
        type: String,
        trim: true,
        maxlength: 500
    },
    }, {
    timestamps: true
})

module.exports = mongoose.model('Expense', expenseSchema);