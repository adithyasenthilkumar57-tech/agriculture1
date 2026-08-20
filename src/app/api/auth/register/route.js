import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';
import { signToken, getTokenFromRequest, verifyToken } from '@/lib/auth/jwt';
import { setCookieHeader } from '@/lib/auth/middleware';

// POST /api/auth/register
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, phone, role, preferredLanguage } = body;

    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, email and password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const validRoles = ['farmer', 'transporter', 'buyer', 'expert'];
    const assignedRole = validRoles.includes(role) ? role : 'farmer';

    await connectDB();

    // Auto-promote admin email
    const adminEmail = process.env.ADMIN_EMAIL;
    const finalRole = adminEmail && email.toLowerCase() === adminEmail.toLowerCase() ? 'admin' : assignedRole;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone?.trim(),
      role: finalRole,
      preferredLanguage: preferredLanguage || 'en',
    });

    const token = signToken({ userId: user._id.toString(), role: user.role });

    const response = NextResponse.json(
      {
        success: true,
        message: 'Account created successfully.',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          preferredLanguage: user.preferredLanguage,
        },
      },
      { status: 201 }
    );

    response.headers.set('Set-Cookie', setCookieHeader(token));
    return response;
  } catch (error) {
    console.error('[Register]', error);
    return NextResponse.json(
      { success: false, error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
