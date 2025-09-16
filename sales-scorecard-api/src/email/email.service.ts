import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    const smtpConfig = {
      host: this.configService.get('SMTP_HOST'),
      port: parseInt(this.configService.get('SMTP_PORT') || '587'),
      secure: this.configService.get('SMTP_PORT') === '465',
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    };

    // Only create transporter if SMTP is configured
    if (smtpConfig.host && smtpConfig.auth.user && smtpConfig.auth.pass) {
      this.transporter = nodemailer.createTransport(smtpConfig);
    }
  }

  async sendReportEmail(
    to: string,
    subject: string,
    htmlContent: string,
    attachments?: Array<{
      filename: string;
      content: Buffer;
      contentType: string;
    }>
  ): Promise<boolean> {
    try {
      if (!this.transporter) {
        console.error('SMTP not configured - email service unavailable');
        return false;
      }

      const mailOptions = {
        from: this.configService.get('SMTP_FROM'),
        to,
        subject,
        html: htmlContent,
        attachments,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  async sendExportReport(
    to: string,
    reportType: string,
    data: Buffer,
    filename: string,
    format: 'csv' | 'pdf'
  ): Promise<boolean> {
    const contentType = format === 'csv' ? 'text/csv' : 'application/pdf';
    
    const htmlContent = `
      <h2>Sales Scorecard Report</h2>
      <p>Please find attached your requested ${reportType} report.</p>
      <p><strong>Report Type:</strong> ${reportType}</p>
      <p><strong>Format:</strong> ${format.toUpperCase()}</p>
      <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
      
      <hr>
      <p><em>This report was generated from the Sales Scorecard system.</em></p>
      <p><em>For questions or support, contact your system administrator.</em></p>
    `;

    return this.sendReportEmail(
      to,
      `Sales Scorecard ${reportType} Report`,
      htmlContent,
      [
        {
          filename,
          content: data,
          contentType,
        },
      ]
    );
  }

  async sendWeeklySummary(
    to: string,
    summaryData: {
      totalEvaluations: number;
      averageScore: number;
      topPerformers: string[];
      improvementAreas: string[];
    }
  ): Promise<boolean> {
    const htmlContent = `
      <h2>Weekly Performance Summary</h2>
      <p>Here's your weekly performance summary for the Sales Scorecard system.</p>
      
      <h3>Key Metrics</h3>
      <ul>
        <li><strong>Total Evaluations:</strong> ${summaryData.totalEvaluations}</li>
        <li><strong>Average Score:</strong> ${summaryData.averageScore.toFixed(2)}</li>
      </ul>
      
      <h3>Top Performers</h3>
      <ul>
        ${summaryData.topPerformers.map(performer => `<li>${performer}</li>`).join('')}
      </ul>
      
      <h3>Areas for Improvement</h3>
      <ul>
        ${summaryData.improvementAreas.map(area => `<li>${area}</li>`).join('')}
      </ul>
      
      <hr>
      <p><em>This summary was automatically generated from the Sales Scorecard system.</em></p>
    `;

    return this.sendReportEmail(
      to,
      'Weekly Sales Performance Summary',
      htmlContent
    );
  }
}
