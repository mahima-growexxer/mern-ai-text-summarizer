/**
 * @author Mahima Gajiwala
 * @copyright 2025
 * 
 * Authentication routes for AI Text Summarizer
 * Handles user signup and signin
 */

import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user";
import type { Request, Response } from "express";

const router = express.Router();

/**
 * Sign up a new user
 * POST /api/auth/signup
 */
router.post("/signup", async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Basic validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: "Email and password are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: "Password must be at least 6 characters long"
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: "User already exists with this email"
            });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user
        const user = new User({
            email,
            password: hashedPassword,
            isAdmin: false // Default to non-admin
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email, isAdmin: user.isAdmin },
            process.env.JWT_SECRET || "fallback-secret-key",
            { expiresIn: "24h" }
        );

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: {
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    isAdmin: user.isAdmin
                }
            }
        });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
});

/**
 * Sign in an existing user
 * POST /api/auth/signin
 */
router.post("/signin", async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Basic validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: "Email and password are required"
            });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                error: "Invalid email or password"
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: "Invalid email or password"
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email, isAdmin: user.isAdmin },
            process.env.JWT_SECRET || "fallback-secret-key",
            { expiresIn: "24h" }
        );

        res.json({
            success: true,
            message: "Sign in successful",
            data: {
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    isAdmin: user.isAdmin
                }
            }
        });
    } catch (error) {
        console.error("Signin error:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
});

export default router;
