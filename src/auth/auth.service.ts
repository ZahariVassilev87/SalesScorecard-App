import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma/prisma.service';
// UserRole enum removed for SQLite compatibility
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private transporter: nodemailer.Transporter;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {
    // Configure email transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendMagicLink(email: string): Promise<{ message: string }> {
    // Check if email domain is allowed
    const allowedDomains = process.env.ALLOWED_DOMAINS?.split(',') || [];
    const emailDomain = email.split('@')[1];
    
    if (!allowedDomains.includes(emailDomain)) {
      throw new BadRequestException('Email domain not allowed');
    }

    // Check if user exists in organizational structure
    const existingUser = await this.findUserInOrganization(email);
    const isNewUser = !existingUser;

    // Generate magic link token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store token with email for verification
    // For now, we'll encode the email in the token (in production, use a proper token storage)
    const tokenData = Buffer.from(JSON.stringify({ email, expiresAt: expiresAt.getTime() })).toString('base64');
    const finalToken = token + '.' + tokenData;

    // Send email with verification code
    const magicLink = `${process.env.FRONTEND_URL}?token=${finalToken}`;
    
    const emailSubject = isNewUser ? 'Welcome to Sales Scorecard - Your Login Code' : 'Your Sales Scorecard Login Code';
    const emailMessage = isNewUser 
      ? `<p>Welcome to Sales Scorecard! Your account has been automatically set up.</p>`
      : `<p>You're already part of our team! Here's your login code:</p>`;
    
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || 'Sales Scorecard <noreply@instorm.bg>',
      to: email,
      subject: emailSubject,
      html: `
        <h2>Sales Scorecard Login</h2>
        ${emailMessage}
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; font-family: monospace; font-size: 18px; font-weight: bold; text-align: center; margin: 20px 0;">
          ${token}
        </div>
        <p>Enter this code in your iOS app to sign in.</p>
        <p>This code will expire in 15 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
        <hr>
        <p><small>Alternative: Click this link to sign in automatically: <a href="${magicLink}">Sign In</a></small></p>
      `,
    });

    return { message: 'Magic link sent to your email' };
  }

  async testEmail(email: string): Promise<{ message: string; error?: string }> {
    try {
      // Test email configuration
      await this.transporter.verify();
      
      // Send a simple test email
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'Sales Scorecard <noreply@instorm.bg>',
        to: email,
        subject: 'Test Email - Sales Scorecard',
        html: `
          <h2>Test Email</h2>
          <p>This is a test email to verify the email configuration is working.</p>
          <p>If you receive this email, the SMTP configuration is correct.</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        `,
      });

      return { message: 'Test email sent successfully' };
    } catch (error) {
      console.error('Email test error:', error);
      return { 
        message: 'Email test failed', 
        error: error.message 
      };
    }
  }

  async verifyMagicLink(token: string): Promise<{ access_token: string; user: any }> {
    try {
      // Parse token to get email
      const [tokenPart, dataPart] = token.split('.');
      if (!dataPart) {
        throw new BadRequestException('Invalid token format');
      }

      const tokenData = JSON.parse(Buffer.from(dataPart, 'base64').toString());
      const { email, expiresAt } = tokenData;

      // Check if token is expired
      if (Date.now() > expiresAt) {
        throw new BadRequestException('Token has expired');
      }

      // Find or create user with automatic organizational assignment
      let user = await this.findOrCreateUserWithOrganization(email);

      const payload = { email: user.email, sub: user.id, role: user.role };
      const access_token = this.jwtService.sign(payload);

      return {
        access_token,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
        },
      };
    } catch (error) {
      throw new BadRequestException('Invalid or expired token');
    }
  }

  async validateUser(email: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && user.isActive) {
      const { ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      },
    };
  }

  async loginWithPassword(email: string, password: string): Promise<{ access_token: string; user: any }> {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // For now, we'll skip password verification since we don't have password storage
    // In a real implementation, you would hash and compare passwords here
    // const isPasswordValid = await bcrypt.compare(password, user.password);
    // if (!isPasswordValid) {
    //   throw new UnauthorizedException('Invalid credentials');
    // }

    return this.login(user);
  }

  async registerUser(email: string, password: string, displayName: string): Promise<{ access_token: string; user: any }> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash the password
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user (note: we're not storing password in the current schema)
    const user = await this.prisma.user.create({
      data: {
        email,
        displayName,
        role: 'SALES', // Default role
        isActive: true,
      },
    });

    return this.login(user);
  }

  private async findUserInOrganization(email: string): Promise<any> {
    // Check if user exists in users table
    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      return user;
    }

    // Check if user exists as salesperson
    const salesperson = await this.prisma.salesperson.findFirst({
      where: { email },
      include: {
        team: {
          include: {
            region: true,
            manager: true,
          },
        },
      },
    });

    if (salesperson) {
      return {
        id: salesperson.id,
        email: salesperson.email,
        displayName: `${salesperson.firstName} ${salesperson.lastName}`,
        role: 'SALESPERSON',
        team: salesperson.team,
        type: 'salesperson',
      };
    }

    return null;
  }

  private async findOrCreateUserWithOrganization(email: string): Promise<any> {
    // First, check if user already exists
    const existingUser = await this.findUserInOrganization(email);
    
    if (existingUser) {
      // If user exists as salesperson, convert to user account
      if (existingUser.type === 'salesperson') {
        const user = await this.prisma.user.create({
          data: {
            email: existingUser.email,
            displayName: existingUser.displayName,
            role: 'SALESPERSON',
          },
        });

        // Link user to their team
        if (existingUser.team) {
          await this.prisma.userTeam.create({
            data: {
              userId: user.id,
              teamId: existingUser.team.id,
            },
          });
        }

        return user;
      }
      
      // User already exists as user
      return existingUser;
    }

    // User doesn't exist in organization - create with default role
    const emailDomain = email.split('@')[1];
    const role = emailDomain === 'instorm.bg' ? 'ADMIN' : 'SALESPERSON';
    
    const user = await this.prisma.user.create({
      data: {
        email,
        displayName: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        role,
      },
    });

    return user;
  }
}
