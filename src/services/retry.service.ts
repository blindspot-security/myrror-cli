import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

import { IStatusResponse } from '../types';
import { AuthService } from './auth.service';
import { IssuesService } from './issues.service';
import { EScanningStatus } from '../types/scanning-status.enum';

@Injectable()
export class RetryService {
  constructor(
    private logger: Logger,
    private authService: AuthService,
    private issuesService: IssuesService,
  ) {}

  continueStatuses = [EScanningStatus.WAITING, EScanningStatus.SCANNING];
  abortStatuses = [EScanningStatus.SKIPPED, EScanningStatus.SCANNED];

  async retryUntilSuccess(url: string, maxExecutionTime: number, retryTime: number) {
    const timeout = setTimeout(() => {
      this.logger.error('execution time exceeded. Stopping...');
      process.exit(1);
    }, maxExecutionTime);

    const interval = setInterval(async () => {
      try {
        const token = await this.authService.getToken();

        const response = await axios.get<IStatusResponse>(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        this.logger.log(`status is ${response.data?.status}`);

        if (!response.data || this.abortStatuses.includes(response.data.status)) {
          clearInterval(interval);
          clearTimeout(timeout);

          if (response.data?.status === EScanningStatus.SCANNED) {
            const { repoId, branchId } = response.data;
            if (!repoId || !branchId) {
              this.logger.error('repoId or branchId is not provided');
              process.exit(1);
            }
            const { issues, message } = await this.issuesService.getIssues(repoId, branchId);
            if (issues.data.length === 0) {
              this.logger.log('No issues found');
              process.exit(0); // Exit with success
            } else {
              await this.issuesService.drawIssuesTable(issues.data);
              if (message) {
                this.logger.log(message);
              }
              process.exit(1);
            }
          } else {
            this.logger.error(`Scan was ${response.data?.status || 'aborted'}`);
            process.exit(1);
          }
        } else if (this.continueStatuses.includes(response.data.status)) {
          this.logger.log('retrying...');
        }
      } catch (error) {
        if (error.response?.status === 401) {
          this.logger.error('Unauthorized');
        } else if (error.response?.status === 403) {
          this.logger.error('Not enough permissions');
        } else {
          this.logger.error(error.message);
        }

        clearInterval(interval);
        clearTimeout(timeout);
        process.exit(1);
      }
    }, retryTime);
  }
}
