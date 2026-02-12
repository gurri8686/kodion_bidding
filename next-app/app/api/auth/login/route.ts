/**
 * POST /api/auth/login
 * User login endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '@/lib/db/models';
import { sequelize } from '@/lib/db/connection';

const SECRET_KEY = process.env.SECRET_KEY || 'dev_secret_change_me';

// Route segment config for Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    console.log(`🔐 Login attempt for: ${email}`);

    // Quick DB health check with timeout (10 seconds max)
    try {
      await Promise.race([
        sequelize.authenticate(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('DB connection timeout after 10s')), 10000)
        )
      ]);
    } catch (dbErr: any) {
      console.error('DB connection error:', {
        message: dbErr?.message || 'Unknown error',
        code: dbErr?.code,
        host: process.env.MYSQL_DB_HOST,
        name: dbErr?.name
      });
      return NextResponse.json(
        { 
          error: 'Database connection failed. Please check server configuration.',
          details: process.env.NODE_ENV === 'development' ? dbErr?.message : undefined
        },
        { status: 503 }
      );
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.warn(`⚠️  Login failed: User not found for email=${email}`);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 400 }
      );
    }

    // Check if user is blocked
    if (user.status === 'blocked') {
      return NextResponse.json(
        { error: 'Your account is blocked by the admin.' },
        { status: 403 }
      );
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn(`⚠️  Login failed: Invalid password for user id=${user.id}`);
      return NextResponse.json(
        { error: 'Invalid Password' },
        { status: 400 }
      );
    }

    // Update last active
    user.lastActive = new Date();
    await user.save();

    // Generate JWT Token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      SECRET_KEY,
      { expiresIn: '1d' }
    );

    // Create response with user data
    const response = NextResponse.json({
      message: 'Login successful',
      role: user.role,
      token,
      userId: user.id,
      user: {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });

    // Set httpOnly cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 6 * 60 * 60, // 6 hours in seconds
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Login Error:', error?.stack || error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
