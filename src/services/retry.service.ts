import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

import { IStatusResponse } from 'src/types';
import { AuthService } from './auth.service';
import { IssuesService } from './issues.service';
import { EScanningStatus } from 'src/types/scanning-status.enum';

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
      this.logger.error(`execution time exceeded. Stopping...`);
      process.exitCode = 1;
      process.exit();
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
          if (response.data.status === EScanningStatus.SCANNED) {
            const { repoId, branchId } = response.data;
            if (!repoId || !branchId) {
              this.logger.error('repoId or branchId is not provided');
              process.exitCode = 1;
              process.exit();
            }
            const issues = await this.issuesService.getIssues(repoId, branchId);
            if (issues.data.length === 0) {
              this.logger.log('No issues found');
              process.exit();
            } else {
              await this.issuesService.drawIssuesTable(issues.data);
              process.exitCode = 1;
              process.exit();
            }
          }
          process.exitCode = 1;
          process.exit();
        }

        if (this.continueStatuses.includes(response.data.status)) {
          this.logger.log('retrying...');
          return;
        }
      } catch (error) {
        this.logger.error(error.message);
        process.exitCode = 1;
        clearInterval(interval); // Stop the interval on error
        clearTimeout(timeout); // Clear the timeout on error
      } finally {
        if (process.exitCode === 1) {
          process.exit();
        }
      }
    }, retryTime);
  }
}
