import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly tagLength = 16;
  private readonly encryptionKey: Buffer;

  constructor(private configService: ConfigService) {
    // Get encryption key from environment or generate a default one
    const keyString = this.configService.get<string>('ENCRYPTION_KEY');
    if (keyString) {
      this.encryptionKey = Buffer.from(keyString, 'hex');
    } else {
      // Generate a key if none is provided (for development only)
      console.warn('ENCRYPTION_KEY not set, using default key. This is not secure for production!');
      this.encryptionKey = crypto.scryptSync('default-key-change-in-production', 'salt', this.keyLength);
    }
  }

  encrypt(text: string): string {
    try {
      const iv = crypto.randomBytes(this.ivLength);
      const cipher = crypto.createCipher(this.algorithm, this.encryptionKey);
      cipher.setAAD(Buffer.from('sales-scorecard', 'utf8'));

      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const tag = cipher.getAuthTag();

      // Combine iv, tag, and encrypted data
      const combined = iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted;
      return Buffer.from(combined).toString('base64');
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  decrypt(encryptedData: string): string {
    try {
      const combined = Buffer.from(encryptedData, 'base64').toString('utf8');
      const parts = combined.split(':');

      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }

      const iv = Buffer.from(parts[0], 'hex');
      const tag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];

      const decipher = crypto.createDecipher(this.algorithm, this.encryptionKey);
      decipher.setAAD(Buffer.from('sales-scorecard', 'utf8'));
      decipher.setAuthTag(tag);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  hashPassword(password: string): string {
    const salt = crypto.randomBytes(32);
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');
    return salt.toString('hex') + ':' + hash.toString('hex');
  }

  verifyPassword(password: string, hashedPassword: string): boolean {
    try {
      const parts = hashedPassword.split(':');
      if (parts.length !== 2) {
        return false;
      }

      const salt = Buffer.from(parts[0], 'hex');
      const hash = Buffer.from(parts[1], 'hex');
      const verifyHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');

      return crypto.timingSafeEqual(hash, verifyHash);
    } catch (error) {
      console.error('Password verification failed:', error);
      return false;
    }
  }

  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  generateApiKey(): string {
    const prefix = 'ss_'; // Sales Scorecard prefix
    const key = this.generateSecureToken(32);
    return prefix + key;
  }

  hashApiKey(apiKey: string): string {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
  }

  verifyApiKey(apiKey: string, hashedApiKey: string): boolean {
    const hash = crypto.createHash('sha256').update(apiKey).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(hashedApiKey, 'hex'));
  }

  // Field-level encryption for sensitive data
  encryptSensitiveField(value: string): string {
    if (!value) return value;
    return this.encrypt(value);
  }

  decryptSensitiveField(encryptedValue: string): string {
    if (!encryptedValue) return encryptedValue;
    try {
      return this.decrypt(encryptedValue);
    } catch (error) {
      // If decryption fails, return the original value (might not be encrypted)
      return encryptedValue;
    }
  }

  // Bulk encryption/decryption for arrays
  encryptArray(items: string[]): string[] {
    return items.map(item => this.encryptSensitiveField(item));
  }

  decryptArray(encryptedItems: string[]): string[] {
    return encryptedItems.map(item => this.decryptSensitiveField(item));
  }

  // Generate secure random values
  generateSecureRandom(length: number = 16): string {
    return crypto.randomBytes(length).toString('base64url');
  }

  // Create HMAC for data integrity
  createHmac(data: string, secret?: string): string {
    const hmacSecret = secret || this.configService.get<string>('HMAC_SECRET') || 'default-secret';
    return crypto.createHmac('sha256', hmacSecret).update(data).digest('hex');
  }

  verifyHmac(data: string, hmac: string, secret?: string): boolean {
    const expectedHmac = this.createHmac(data, secret);
    return crypto.timingSafeEqual(Buffer.from(hmac, 'hex'), Buffer.from(expectedHmac, 'hex'));
  }
}

