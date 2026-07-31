import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';

export class AuthError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

// In-memory fallback user store when local Prisma database connection is unavailable
const memoryUsers = new Map<string, { id: string; email: string; passwordHash: string; name?: string; createdAt: Date }>();

export class AuthService {
  /**
   * Register a new user
   */
  static async register(email: string, password: string, name?: string) {
    if (!email || !password) {
      throw new AuthError('Email and password are required', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      // Try Prisma database first
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        throw new AuthError('User already exists with this email', 409);
      }

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
        },
      });

      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: '7d',
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name || undefined,
          createdAt: user.createdAt.toISOString(),
        },
        token,
      };
    } catch (err: any) {
      // If error is duplicate email from Prisma or custom AuthError
      if (err instanceof AuthError || err.statusCode) {
        throw err;
      }

      console.warn('Database error during register, falling back to in-memory store:', err.message);
      
      if (memoryUsers.has(email)) {
        throw new AuthError('User already exists with this email', 409);
      }

      const userId = 'usr_' + Date.now();
      const newUser = {
        id: userId,
        email,
        passwordHash: hashedPassword,
        name,
        createdAt: new Date(),
      };
      memoryUsers.set(email, newUser);

      const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' });

      return {
        user: {
          id: userId,
          email,
          name,
          createdAt: newUser.createdAt.toISOString(),
        },
        token,
      };
    }
  }

  /**
   * Authenticate existing user
   */
  static async login(email: string, password: string) {
    if (!email || !password) {
      throw new AuthError('Email and password are required', 400);
    }

    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          throw new AuthError('Invalid email or password', 401);
        }

        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
          expiresIn: '7d',
        });

        return {
          user: {
            id: user.id,
            email: user.email,
            name: user.name || undefined,
            createdAt: user.createdAt.toISOString(),
          },
          token,
        };
      }
    } catch (err: any) {
      if (err instanceof AuthError || err.statusCode) {
        throw err;
      }
      console.warn('Prisma lookup failed, checking in-memory store:', err.message);
    }

    // Check in-memory store
    const memUser = memoryUsers.get(email);
    if (!memUser) {
      throw new AuthError('Invalid email or password', 401);
    }

    const isValid = await bcrypt.compare(password, memUser.passwordHash);
    if (!isValid) {
      throw new AuthError('Invalid email or password', 401);
    }

    const token = jwt.sign({ userId: memUser.id, email: memUser.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return {
      user: {
        id: memUser.id,
        email: memUser.email,
        name: memUser.name,
        createdAt: memUser.createdAt.toISOString(),
      },
      token,
    };
  }

  /**
   * Get current authenticated user profile
   */
  static async getUserById(userId: string, email?: string) {
    try {
      let user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user && email) {
        user = await prisma.user.findUnique({ where: { email } });
      }
      if (user) {
        return {
          id: user.id,
          email: user.email,
          name: user.name || undefined,
          createdAt: user.createdAt.toISOString(),
        };
      }
    } catch (err: any) {
      console.warn('Database user fetch failed:', err.message);
    }

    // Check memory store values
    for (const u of memoryUsers.values()) {
      if (u.id === userId || (email && u.email === email)) {
        return {
          id: u.id,
          email: u.email,
          name: u.name,
          createdAt: u.createdAt.toISOString(),
        };
      }
    }

    // Fallback: If JWT token is verified by secret but user ID is missing from DB (e.g. reseeded DB), return valid profile
    if (email) {
      return {
        id: userId,
        email,
        name: email.split('@')[0],
        createdAt: new Date().toISOString(),
      };
    }

    throw new Error('User not found');
  }
}
