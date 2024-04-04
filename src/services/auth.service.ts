import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

import { ITokenResponse } from 'src/types';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private logger: Logger,
  ) {}
  token: string;
  expiredAt: number;

  private async setToken() {
    try {
      const url = this.configService.get<string>('app.apiUrl');
      const clientId = this.configService.get<string>('app.clientId');
      const clientSecret = this.configService.get<string>('app.clientSecret');

      const response = await axios.post<ITokenResponse>(`${url}/org/tokens/authenticate`, {
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
