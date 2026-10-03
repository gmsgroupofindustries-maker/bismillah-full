import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'bismillah_motors_secure_jwt_secret_2026_super_safe';

export interface AdminAuthPayload {
  userId: number;
  email: string;
  role: string;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  adminUser?: AdminAuthPayload;
}

export function generateToken(payload: AdminAuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): AdminAuthPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminAuthPayload;
  } catch {
    return null;
  }
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Admin authentication token required' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }

  req.adminUser = decoded;
  next();
}
