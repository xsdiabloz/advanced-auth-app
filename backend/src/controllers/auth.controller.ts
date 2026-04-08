import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { User } from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendResetSuccessEmail,
} from "../mailtrap/emails.js";

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
    await sendVerificationEmail(newUser.email, verificationToken);

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { code } = req.body;

  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;

    await user.save();
    await sendWelcomeEmail(user.email, user.name);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        ...user._id,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("error in verifyEmail ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const passwordCorrect = await bcrypt.compare(password, user.password);
    if (!passwordCorrect) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }
    generateToken(res, user._id);
    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: {
        ...user._id,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("Error in login ", error);
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "logged out successfully" });
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hr

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = new Date(resetTokenExpiresAt);

    await sendPasswordResetEmail(
      user.email,
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`,
    );
    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });

    await user.save();
  } catch (error) {
    console.log("Error in forgotPassword ", error);
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset token" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();
    await sendResetSuccessEmail(user.email);
    res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.log("Error in resetPassword ", error);
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};
