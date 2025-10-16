const { get } = require('mongoose');
const Expense = require('../models/expense');
const addExpense = async (req, res) => {
    const {date, branch, expenseType, amount, modeOfPayment, paymentTo, vehicleNumber, remarks} = req.body;
    try {
        const expense = await Expense.create({userId: req.user.id, date, branch, expenseType, amount, modeOfPayment, paymentTo, vehicleNumber, remarks});
        if(!expense){
            return res.status(400).json({message: 'Error adding expense'});
        }
        console.log(expense);
        return res.status(201).json({message: 'Expense added successfully', expense});
    }
    catch(err){
        console.error('Add expense error:', err);
        return res.status(500).json({message: 'Server error'});
    }
}

const getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({userId: req.user.id}).sort({date: -1});
        if(!expenses){
            return res.status(404).json({message: 'No expenses found'});
        }
        console.log(expenses);
        return res.status(200).json({expenses});
    }
    catch(err){
        console.error('Get expenses error:', err);
        return res.status(500).json({message: 'Server error'});
    }
}

const handleDeleteExpense = async (req, res) => {
    const { id } = req.params;
    try {
        const expense = await Expense.findOneAndDelete({ _id: id, userId: req.user.id });
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found or unauthorized' });
        }
        return res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (err) {
        console.error('Delete expense error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

const updateExpense = async (req, res) => {
    const { id } = req.params;
    const {date, branch, expenseType, amount, modeOfPayment, paymentTo, vehicleNumber, remarks} = req.body;
    try {
        const expense = await Expense.findOneAndUpdate(
            { _id: id, userId: req.user.id },
            { date, branch, expenseType, amount, modeOfPayment, paymentTo, vehicleNumber, remarks },
            { new: true }
        );
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found or unauthorized' });
        }
        return res.status(200).json({ message: 'Expense updated successfully', expense });
    } catch (err) {
        console.error('Update expense error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { addExpense, getExpenses, handleDeleteExpense, updateExpense };