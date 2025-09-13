import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class MagicLinkStrategy extends PassportStrategy(Strategy, 'magic-link') {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'token',
      passwordField: 'token',
    });
  }

  async validate(token: string): Promise<any> {
    if (!token) {
      throw new Error('Token is required');
    }

    const result = await this.authService.verifyMagicLink(token);
    return result.user;
  }
}
