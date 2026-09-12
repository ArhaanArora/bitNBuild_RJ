import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { users, admins } from '../db/schema';
import { eq } from 'drizzle-orm';

export interface AuthUser {
  id: string;
  email: string;
  role: 'candidate' | 'recruiter' | 'organizer' | 'admin' | string;
  status?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  adminRole: 'super_admin' | 'security_admin' | 'verification_admin' | 'support_admin';
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      admin?: AdminUser;
    }
  }
}

const TIER_LEVELS: Record<string, number> = {
  support_admin: 1,
  verification_admin: 2,
  security_admin: 3,
  super_admin: 4,
};

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized: Session token required' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as AuthUser;
    
    // Server-side database verification: ensure user exists and is active
    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.id),
      columns: { id: true, email: true, role: true, status: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: Account not found' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        error: 'Your account is currently under review. Contact support for details.',
        status: 'suspended',
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as any,
      status: user.status,
    };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session token' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: Access restricted to [${roles.join(', ')}] workspaces. Current role: ${req.user?.role || 'none'}`,
      });
    }
    next();
  };
}

export async function requireAdmin(minTier: 'super_admin' | 'security_admin' | 'verification_admin' | 'support_admin' = 'support_admin') {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Unauthorized: Admin authentication token required' });

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as AdminUser;
      
      // Verify against isolated admins table
      const admin = await db.query.admins.findFirst({
        where: eq(admins.id, payload.id),
      });

      if (!admin || admin.status !== 'active') {
        return res.status(403).json({ error: 'Forbidden: Admin account is inactive or revoked' });
      }

      const userLevel = TIER_LEVELS[admin.adminRole] || 0;
      const reqLevel = TIER_LEVELS[minTier] || 0;

      if (userLevel < reqLevel) {
        return res.status(403).json({
          error: `Forbidden: Action requires at least [${minTier}] privilege level. Current tier: [${admin.adminRole}]`,
        });
      }

      req.admin = {
        id: admin.id,
        email: admin.email,
        adminRole: admin.adminRole,
        name: admin.name,
      };
      next();
    } catch {
      return res.status(401).json({ error: 'Invalid or expired admin credential token' });
    }
  };
}
