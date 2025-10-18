const dotenv = require('dotenv');
dotenv.config();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
};


const handleUserLogin = async (req, res) => {
    const { email, password } = req.body;
    const secret = process.env.JWT_SECRET;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const user = await User.findOne({ email }); 

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if(!user.password){
            return res.status(400).json({message: 'This account uses a social login. Please sign in with Google/OAuth.'});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, secret, { expiresIn: '1d' });
        res.cookie('token', token, cookieOptions);

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

        if(!user){
            return res.status(400).json({message: 'Error creating user'});
        }

        const token = jwt.sign({id: user._id}, secret, { expiresIn: '1d' });
        res.cookie('token', token, cookieOptions);

        return res.status(201).json({message: 'User created successfully', user: { id: user._id, email: user.email, username: user.username }});
    }
    catch(err){
        console.error('Signup error:', err);
        return res.status(500).json({message: 'Server error'});
    }
}

const handleLogout = (req, res) => {
    res.cookie('token', '', { ...cookieOptions, expires: new Date(0) });
    return res.status(200).json({ message: 'Logout successful' });
}

module.exports = {handleUserLogin, handleSignUp, handleLogout};