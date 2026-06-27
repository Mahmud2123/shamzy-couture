import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

export const prisma = new PrismaClient();
export const JWT_SECRET = process.env.JWT_SECRET || 'shamzy-super-secret-key-2024';

export function ok(res: any, data: any, status = 200) {
  return res.status(status).json(data);
}

export function err(res: any, message: string, status = 400) {
  return res.status(status).json({ error: message });
}

export function setCors(res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function requireAuth(req: any, res: any): any {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return null;
  }
  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded || typeof decoded === 'string') {
    res.status(401).json({ error: 'Invalid or expired token' });
    return null;
  }
  return decoded;
}

export async function requireAdmin(req: any, res: any): Promise<any> {
  const decoded = requireAuth(req, res);
  if (!decoded) return null;
  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user || user.role !== 'ADMIN') {
    res.status(403).json({ error: 'Admin access required' });
    return null;
  }
  return user;
}

export function generateToken(user: any): string {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: '7d',
  });
}

export async function audit(userId: string, action: string, entity: string, entityId?: string, details?: any) {
  try {
    await prisma.auditLog.create({
      data: { userId, action, entity, entityId, details },
    });
  } catch {
    // non-blocking
  }
}
