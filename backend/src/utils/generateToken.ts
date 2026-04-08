import { Response } from "express";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";

const jwtSecret = process.env.JWT_SECRET;

export const generateToken = (
  res: Response,
  userId: Types.ObjectId | string,
) => {
  if (!jwtSecret) return;

  const token = jwt.sign({ userId }, jwtSecret, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return token;
};
