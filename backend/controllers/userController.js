import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import UserModel from '../models/userModel.js';

dotenv.config()
const secretKey = process.env.JWT_SECRET || 'test';


export const signUp = async (req, res) => {
    const { email, password, firstName, lastName } = req.body;

    try {
        const user = await UserModel.findOne({ email });

        if (user) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 12)

        const result = await UserModel.create({ email, password: hashedPassword, name: `${firstName} ${lastName}` });

        const token = jwt.sign({ email: result.email, id: result._id }, secretKey, { expiresIn: "7d" });

        res.status(201).json({ success: true, data: { result, token } });
    }
    catch (err) {
        res.status(500).json({ message: "Something went wrong" });

        console.error(err);
    }
}

export const signIn = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await UserModel.findOne({ email });

        if (!user) return res.status(400).json({ message: 'User doesn\'t exist' });

        const isPasswordSame = await bcrypt.compare(password, user.password);

        if (!isPasswordSame) return res.status(400).json({ success: false, message: "Invalid credentials" });

        const token = jwt.sign({ email: user.email, id: user._id }, secretKey, { expiresIn: "7d" });

        res.status(200).json({ success: true, data: { result: user, token } });

    }
    catch (err) {
        res.status(500).json({ message: "Something went wrong" });

        console.error(err)
    }
}