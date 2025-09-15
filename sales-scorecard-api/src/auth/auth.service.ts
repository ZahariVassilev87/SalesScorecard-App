import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma/prisma.service';
// UserRole enum removed for SQLite compatibility
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';
// import * as bcrypt from 'bcryptjs'; // Temporarily disabled for Railway
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

@Injectable()
export class AuthService {
  private transporter: nodemailer.Transporter;
  private sesClient: SESClient;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {
    // Configure email transporter with better timeout settings
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,   // 10 seconds
      socketTimeout: 10000,     // 10 seconds
    });

    // Configure AWS SES client
    this.sesClient = new SESClient({
      region: process.env.AWS_REGION || 'eu-north-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
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

    // For testing: if SMTP is not working, return a mock response
    if (process.env.SKIP_EMAIL === 'true') {
      console.log(`Mock email sent to ${email} - SMTP disabled for testing`);
      return { message: 'Mock email sent (SMTP disabled for testing)' };
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

  async testEmail(email: string): Promise<{ success: boolean; message: string }> {
    try {
      // Test the email transporter configuration
      await this.transporter.verify();
      
      // Send a simple test email
      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: 'Sales Scorecard - Email Test',
        text: 'This is a test email to verify the email service configuration.',
        html: `
          <h2>Sales Scorecard - Email Test</h2>
          <p>This is a test email to verify the email service configuration.</p>
          <p>If you receive this email, the SMTP configuration is working correctly!</p>
          <p>Time: ${new Date().toISOString()}</p>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      
      return {
        success: true,
        message: `Test email sent successfully to ${email}`
      };
    } catch (error) {
      console.error('Email test failed:', error);
      return {
        success: false,
        message: `Email test failed: ${error.message}`
      };
    }
  }

  // New invite-only registration methods (using existing schema)
  async checkEmailEligibility(email: string): Promise<{ eligible: boolean; message: string; user?: any; isRegistered?: boolean }> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return {
          eligible: false,
          message: 'Email not found. Contact your admin to get access to the system.'
        };
      }

      // Check if user has a password (indicates they've registered)
      const isRegistered = true; // Temporarily assume all users are registered for Railway

      return {
        eligible: true,
        message: isRegistered 
          ? 'Email is already registered. You can log in with your password.'
          : 'Email is eligible for registration. Please set up your password.',
        isRegistered,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          role: user.role
        }
      };
    } catch (error) {
      console.error('Error checking email eligibility:', error);
      return {
        eligible: false,
        message: 'Error checking email eligibility.'
      };
    }
  }

  async registerUser(email: string, password: string, displayName?: string): Promise<{ access_token: string; user: any }> {
    try {
      // Check if email is eligible
      const eligibilityCheck = await this.checkEmailEligibility(email);
      if (!eligibilityCheck.eligible) {
        throw new BadRequestException(eligibilityCheck.message);
      }

      // Check if user is already registered
      if (eligibilityCheck.isRegistered) {
        throw new BadRequestException('User is already registered. Please log in instead.');
      }

      // Update user (password temporarily disabled for Railway)
      const user = await this.prisma.user.update({
        where: { email },
        data: {
          displayName: displayName || eligibilityCheck.user.displayName,
        },
      });

      // Generate JWT token
      const payload = { 
        sub: user.id, 
        email: user.email, 
        role: user.role 
      };
      const access_token = this.jwtService.sign(payload);

      return {
        access_token,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async loginUser(email: string, password: string): Promise<{ access_token: string; user: any }> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      if (!user.isActive) {
        throw new UnauthorizedException('Account is deactivated. Contact your admin.');
      }

      // Check if user has a password set
      // Password validation temporarily disabled for Railway deployment
      // All users can login without password for now

      // Generate JWT token
      const payload = { 
        sub: user.id, 
        email: user.email, 
        role: user.role 
      };
      const access_token = this.jwtService.sign(payload);

      return {
        access_token,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // New method to send emails using AWS SES
  async sendEmailWithSES(to: string, subject: string, htmlContent: string, textContent?: string): Promise<void> {
    try {
      const command = new SendEmailCommand({
        Source: 'zahari.vasilev@instorm.bg',
        Destination: {
          ToAddresses: [to],
        },
        Message: {
          Subject: {
            Data: subject,
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: htmlContent,
              Charset: 'UTF-8',
            },
            Text: {
              Data: textContent || htmlContent.replace(/<[^>]*>/g, ''),
              Charset: 'UTF-8',
            },
          },
        },
      });

      await this.sesClient.send(command);
      console.log(`Email sent successfully to ${to}`);
    } catch (error) {
      console.error('SES email error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
}
