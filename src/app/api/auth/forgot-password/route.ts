import { NextRequest, NextResponse } from 'next/server';
import { forgotPasswordSchema } from '@/lib/validators/auth';
import { z } from 'zod';
import prisma from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = forgotPasswordSchema.parse(body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (!user) {
      // Don't reveal if email exists - security best practice
      return NextResponse.json(
        { message: 'If this email is registered, a password reset link has been sent.' },
        { status: 200 }
      );
    }

    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Update user with reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetTokenExpires: tokenExpires,
      },
    });

    // Send password reset email
    try {
      await sendPasswordResetEmail(
        validated.email,
        `${process.env.NEXTAUTH_URL}/en/forgot-password?token=${resetToken}`
      );
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
    }

    return NextResponse.json(
      { message: 'Password reset email sent.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'Invalid input' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
