import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const secretKey = process.env.AUTH_SECRET_KEY ?? "PUASKH_INI_ENVF";

const expiresIn: string = process.env.AUTH_TOKEN_EXPIRY || "1h";

/**
 * Generate JWT token function
 * 
 * @param id: number
 * @returns string
 */
export const generateToken = (id: number): string => jwt.sign({ id }, secretKey, { expiresIn } as any);

/**
 * Verify token function
 * 
 * @param token: string
 * @returns object | string
 */
export const verifyToken = (token: string): object | string => jwt.verify(token, secretKey);