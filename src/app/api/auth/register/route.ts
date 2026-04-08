import { NextRequest, NextResponse } from 'next/server';
import { registerSchema } from '@/lib/validators/auth';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';
import { sendVerificationEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const validated = registerSchema.parse(body);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'EMAIL_IN_USE', message: 'This email is already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(validated.password, 12);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Auto-verify if SMTP is not configured
    const smtpConfigured = process.env.SMTP_USER && process.env.SMTP_PASSWORD;

    // Create user with profile
    const user = await prisma.user.create({
      data: {
        email: validated.email,
        name: validated.name,
        passwordHash,
        emailVerified: smtpConfigured ? null : new Date(),
        verificationToken: smtpConfigured ? verificationToken : null,
        verificationTokenExpires: smtpConfigured ? tokenExpires : null,
        profile: {
          create: {
            bio: '',
          },
        },
      },
    });

    // Send verification email if SMTP is configured
    if (smtpConfigured) {
      try {
        await sendVerificationEmail(
          validated.email,
          `${process.env.NEXTAUTH_URL}/en/verify-email?token=${verificationToken}`
        );
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Continue anyway, user can request resend
      }
    }

    return NextResponse.json(
      {
        message: smtpConfigured
          ? 'Registration successful. Please verify your email.'
          : 'Registration successful. You can now log in.',
        email: validated.email,
        autoVerified: !smtpConfigured,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
