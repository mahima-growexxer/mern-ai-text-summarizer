/**
 * @author Mahima Gajiwala
 * @copyright 2025
 * 
 * User model for AI Text Summarizer
 * Handles user authentication and authorization
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    email: string;
    password: string;
    isAdmin: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for email lookups
userSchema.index({ email: 1 });

export default mongoose.model<IUser>('User', userSchema);
