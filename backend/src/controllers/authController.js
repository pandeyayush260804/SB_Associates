const bcrypt = require("bcryptjs");

const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// ============================================
// Register User
// ============================================

const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required",
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            email: email.toLowerCase(),
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists",
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: role || "PROJECT_MANAGER",
        });

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token,
            },
        });
    } catch (error) {
        console.error("Register Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while registering user",
        });
    }
};

// ============================================
// Login User
// ============================================

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        // Find user
        const user = await User.findOne({
            email: email.toLowerCase(),
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Check account status
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Your account is inactive",
            });
        }

        // Compare password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token,
            },
        });
    } catch (error) {
        console.error("Login Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while logging in",
        });
    }
};

// ============================================
// Get Current User
// ============================================

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        console.error("Get Me Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching user",
        });
    }
};

// ============================================
// Get All Users
// ============================================

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select("-password")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: users.length,
            data: users,
        });
    } catch (error) {
        console.error("Get All Users Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching users",
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    getAllUsers,
};