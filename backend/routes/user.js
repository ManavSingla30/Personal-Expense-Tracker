const Router = require('express').Router;
const User = require('../models/user');
const { handleUserLogin, handleSignUp, handleLogout } = require('../controllers/user.js');
const router = Router();

router.post('/login', handleUserLogin);
router.post('/signup', handleSignUp);
router.post('/logout', handleLogout);

module.exports = router;