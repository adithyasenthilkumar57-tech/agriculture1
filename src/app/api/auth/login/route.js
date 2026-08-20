import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';
import { signToken } from '@/lib/auth/jwt';
import { setCookieHeader } from '@/lib/auth/middleware';

// POST /api/auth/login
export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email?.trim() || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'Your account has been deactivated. Please contact support.' },
        { status: 403 }
      );
    }

    // Update last login
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    const token = signToken({ userId: user._id.toString(), role: user.role });

    const response = NextResponse.json({
      success: true,
      message: 'Logged in successfully.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferredLanguage: user.preferredLanguage,
        profileImage: user.profileImage,
      },
    });

    response.headers.set('Set-Cookie', setCookieHeader(token));
    return response;
  } catch (error) {
    console.error('[Login]', error);
    return NextResponse.json(
      { success: false, error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}
