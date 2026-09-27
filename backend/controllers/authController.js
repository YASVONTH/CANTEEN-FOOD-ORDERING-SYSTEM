import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d',
    });
};

export const registerUser = async (req, res) => {
    try {
        const { name, username, regNo, userType, email, password } = req.body;

        // Validate regNo starts with 92762
        if (!regNo.startsWith('92762')) {
            return res.status(400).json({ message: 'Registration number must start with 92762' });
        }

        // Check if username already exists
        const userExists = await User.findOne({ studentId: username });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // The old code used 'username' for logging in (which mapped to studentId)
        const user = await User.create({
            name,
            studentId: username,
            password,
            role: userType === 'admin' ? 'admin' : 'student'
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                username: user.studentId,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const authUser = async (req, res) => {
    try {
        const { studentId, password } = req.body;

        const user = await User.findOne({ studentId });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                studentId: user.studentId,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
