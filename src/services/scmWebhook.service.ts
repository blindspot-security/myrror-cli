import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

import { EScmType, IStatusResponse } from '../types';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { ScmService } from './scm.service';

@Injectable()
export class ScmWebhookService {
  constructor(
    private logger: Logger,
    private authService: AuthService,
    private configService: ConfigService,
    private scmService: ScmService,
  ) {
    this.logger = new Logger(ScmWebhookService.name);
  }

  buildEvent(scmType: EScmType): { body: Record<string, any>; headers: Record<string, string> } {
    const scmHandler = this.scmService.getScmHandler(scmType);
    if (!scmHandler) {
      this.logger.error('SCM type is not supported');
      throw new Error('SCM type is not supported');
    }

    const mergeRequestIid = this.configService.get<string>('app.mergeRequestIid');
    let event;

    if (mergeRequestIid) {
      event = scmHandler.buildWebhookMergeRequestEvent();
    } else {
      event = scmHandler.buildWebhookPushEvent();
    }

    return event;
  }

  async sendEvent(scmType: EScmType, event: { body: Record<string, any>; headers: Record<string, string> }): Promise<IStatusResponse> {
    try {
      const token = await this.authService.getToken();
      const scmHandler = this.scmService.getScmHandler(scmType);
      const url = scmHandler.getWebhookUrl();

      const response = await axios.post(url, event.body, {
        headers: {
          ...event.headers,
          'content-type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
