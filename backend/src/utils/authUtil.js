import bcrypt from 'bcryptjs';
import crypto from 'crypto';


// Hash password
export const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

// Compare entered password with hashed password
export const comparePassword = async (enteredPassword, hashedPassword) => {
    return await bcrypt.compare(enteredPassword, hashedPassword);
}

// Hash token (e.g., for password reset)
export const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
}