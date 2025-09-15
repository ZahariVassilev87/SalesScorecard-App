import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';

export class SendMagicLinkDto {
  @IsEmail()
  email: string;
}

export class VerifyMagicLinkDto {
  @IsString()
  token: string;
}

export class CheckEmailDto {
  @IsEmail()
  email: string;
}

export class RegisterUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  displayName?: string;
}

export class LoginUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('magic-link')
  @ApiOperation({ summary: 'Send magic link to email' })
  @ApiResponse({ status: 200, description: 'Magic link sent successfully' })
  async sendMagicLink(@Body() sendMagicLinkDto: SendMagicLinkDto) {
    return this.authService.sendMagicLink(sendMagicLinkDto.email);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify magic link token' })
  @ApiResponse({ status: 200, description: 'Token verified successfully' })
  async verifyMagicLink(@Body() verifyMagicLinkDto: VerifyMagicLinkDto) {
    return this.authService.verifyMagicLink(verifyMagicLinkDto.token);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  async getProfile(@GetUser() user: any) {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
    };
  }

  @Post('check-email')
  @ApiOperation({ summary: 'Check if email is eligible for registration' })
  @ApiResponse({ status: 200, description: 'Email eligibility checked' })
  async checkEmailEligibility(@Body() checkEmailDto: CheckEmailDto) {
    return this.authService.checkEmailEligibility(checkEmailDto.email);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register new user with email and password' })
  @ApiResponse({ status: 200, description: 'User registered successfully' })
  async registerUser(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.registerUser(
      registerUserDto.email,
      registerUserDto.password,
      registerUserDto.displayName
    );
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user with email and password' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  async loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.loginUser(loginUserDto.email, loginUserDto.password);
  }

  @Post('test-email')
  @ApiOperation({ summary: 'Test email functionality with AWS SES' })
  @ApiResponse({ status: 200, description: 'Test email sent successfully' })
  async testEmail(@Body() body: { email: string }) {
    const subject = 'Sales Scorecard API - Test Email';
    const htmlContent = `
      <h2>🎉 Email Test Successful!</h2>
      <p>This is a test email from the Sales Scorecard API using AWS SES.</p>
      <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      <p><strong>From:</strong> zahari.vasilev@instorm.bg</p>
      <p><strong>To:</strong> ${body.email}</p>
      <hr>
      <p><em>If you received this email, the AWS SES integration is working correctly!</em></p>
    `;
    
    await this.authService.sendEmailWithSES(body.email, subject, htmlContent);
    return { message: 'Test email sent successfully!', to: body.email };
  }
}
