const Expense = require('../models/expense');
const { checkUserLogin } = require('../middleware/user');
const { addExpense, getExpenses, handleDeleteExpense, updateExpense } = require('../controllers/expense');
const Router = require('express').Router;
const router = Router();

router.post('/addExpense', checkUserLogin, addExpense)
router.get('/getExpenses', checkUserLogin, getExpenses)
router.delete('/deleteExpense/:id', checkUserLogin, handleDeleteExpense);
router.put('/updateExpense/:id', checkUserLogin, updateExpense);

module.exports = router;
