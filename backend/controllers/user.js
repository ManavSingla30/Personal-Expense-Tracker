const dotenv = require('dotenv');
dotenv.config();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const handleUserLogin = async (req, res) => {
    const { email, password } = req.body;
    const secret = process.env.JWT_SECRET;

    try {
        const user = await User.findOne({ email }); 

        if (!user) {
            return res.status(401).json({ message: 'No user found' });
        }

        if(!user.password){
            return res.status(400).json({message: 'Please login using Google OAuth'});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, secret);
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: false
        });

        return res.status(200).json({ message: 'Login successful', user: { id: user._id, email: user.email, username: user.username } });

    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};
const handleSignUp = async (req, res) => {
    const {fullName, username, email, password, branch} = req.body;
    const secret = process.env.JWT_SECRET;
    try{
        const existingUser = await User.findOne({$or: [{email}, {username}]});
        if(existingUser){
            return res.status(400).json({message: 'User with this email or username already exists'});
        }
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        const user = await User.create({fullName, username, email, password: hash, branch});
        console.log(user);
        if(!user){
            return res.status(400).json({message: 'Error creating user'});
        }
        const token = jwt.sign({id: user._id}, secret);
        res.cookie('token', token);
        return res.status(201).json({message: 'User created successfully'});
    }
    catch(err){
        return res.status(500).json({message: 'Server error'});
    }
}

const handleLogout = (req, res) => {
    res.clearCookie('token', "");
    return res.status(200).json({ message: 'Logout successful' });
}

module.exports = {handleUserLogin, handleSignUp, handleLogout};