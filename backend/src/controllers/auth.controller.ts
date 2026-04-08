import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

export const signup = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password) {
      res.status(400).json({ message: "All fields are required" });
    }

    const existedUser = await User.findOne({ email });
    if (existedUser) {
      res.status(400).json({ message: "User already exists" });
    }

    const hashPassword = await bcrypt.hash(password, 7);
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    const newUser = new User({
      email,
      name,
      password: hashPassword,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });
    await newUser.save();
    generateToken(res, newUser._id);
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};

export const login = async (req: Request, res: Response) => {};

export const logout = async (req: Request, res: Response) => {};
