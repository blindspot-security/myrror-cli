import { Injectable, Logger } from '@nestjs/common';

import { AuthService } from './auth.service';
import { ISendGitlabPullRequestPayload } from 'src/types';
import { HttpRetryService } from '../utils';

@Injectable()
export class WebhookService {
  constructor(
    private readonly logger: Logger,
    private readonly authService: AuthService,
    private readonly httpRetryService: HttpRetryService,
  ) {}

  async sendGitlabPullRequestData(payload: ISendGitlabPullRequestPayload) {
    try {
      const token = await this.authService.getToken();
      const response = await this.httpRetryService.axiosRef.post(`/scm/gitlab/webhooks/cli`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response?.data;
    } catch (error) {
      this.logger.error(error?.response?.data?.message || error.message);
      process.exit(1);
    }
  }
}
