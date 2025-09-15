import { Controller, Get, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { AdminService } from './admin.service';
import { AuthService } from '../auth/auth.service';
import * as path from 'path';

@Controller('simple-admin')
export class SimpleAdminController {
  constructor(
    private adminService: AdminService,
    private authService: AuthService,
  ) {}

  @Get()
  async getAdminPanel() {
    return {
      message: "Sales Scorecard Simple Admin Interface",
      version: "3.0.3",
      endpoints: {
        createUser: "POST /simple-admin/users",
        listUsers: "GET /simple-admin/users",
        resetPassword: "POST /simple-admin/users/:id/reset-password"
      },
      instructions: "Use the endpoints above to manage users. Create users with email, displayName, role, and password."
    };
  }

  @Get('test')
  async testAdmin() {
    return {
      message: "Simple Admin is working!",
      timestamp: new Date().toISOString(),
      status: "ok"
    };
  }

  @Get('users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Post('users')
  async createUser(@Body() userData: {
    email: string;
    displayName: string;
    role: string;
    password: string;
    sendEmail?: boolean;
  }) {
    try {
      // Create the user
      const user = await this.adminService.createUser({
        email: userData.email,
        displayName: userData.displayName,
        role: userData.role,
        password: userData.password,
        isActive: true,
      });

      // Send email with credentials if requested
      if (userData.sendEmail) {
        const subject = 'Welcome to Sales Scorecard - Your Login Credentials';
        const htmlContent = `
          <h2>🎉 Welcome to Sales Scorecard!</h2>
          <p>Your account has been created successfully. Here are your login credentials:</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Login Information:</h3>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Password:</strong> ${userData.password}</p>
            <p><strong>Role:</strong> ${user.role}</p>
          </div>
          
          <p>You can now login to the Sales Scorecard app using these credentials.</p>
          
          <p><strong>Next Steps:</strong></p>
          <ul>
            <li>Download the Sales Scorecard iOS app</li>
            <li>Use the credentials above to login</li>
            <li>Contact your admin if you have any questions</li>
          </ul>
          
          <hr>
          <p><em>This is an automated message from the Sales Scorecard system.</em></p>
        `;

        await this.authService.sendEmailWithSES(user.email, subject, htmlContent);
      }

      return {
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
          isActive: user.isActive,
        },
        credentialsSent: userData.sendEmail || false,
      };
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  @Post('users/:id/reset-password')
  async resetUserPassword(@Body() body: { password: string }) {
    // This would need the user ID from the URL parameter
    // For now, we'll implement a simple version
    throw new Error('Password reset not implemented yet');
  }
}
