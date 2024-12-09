import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ITokenResponse } from 'src/types';
import { HttpRetryService } from '../utils';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: Logger,
    private readonly httpRetryService: HttpRetryService,
  ) {}
  private token: string;
  private expiredAt: number;

  private async setToken() {
    try {
      const clientId = this.configService.get<string>('app.clientId');
      const clientSecret = this.configService.get<string>('app.clientSecret');

      const response = await this.httpRetryService.axiosRef.post<ITokenResponse>(`/org/tokens/authenticate`, {
        clientId: clientId,
        clientSecret: clientSecret,
      });

      this.token = response.data.accessToken;
      this.expiredAt = Date.now() + response.data.expiresIn * 1000;
    } catch (error) {
      if (error.response?.status === 504) {
        this.logger.error('Gateway Timeout');
        this.logger.error('Client ID or Client Secret is incorrect');
      } else {
        this.logger.error(error.message);
      }
      process.exitCode = 1;
      process.exit();
    }
  }

  async getToken() {
    if (!this.token || Date.now() >= this.expiredAt) {
      await this.setToken();
    }
    return this.token;
  }
}
