import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

import { AuthService } from './auth.service';
import { ISendGitlabPullRequestPayload } from 'src/types';

@Injectable()
export class WebhookService {
  constructor(
    private logger: Logger,
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  async sendGitlabPullRequestData(payload: ISendGitlabPullRequestPayload) {
    try {
      const url = this.configService.get<string>('app.apiUrl');
      const token = await this.authService.getToken();
      const response = await axios.post(`${url}/scm/gitlab/webhooks/cli`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response?.data;
    } catch (error) {
      this.logger.error(error.message);
      process.exit(1);
    }
  }
}
