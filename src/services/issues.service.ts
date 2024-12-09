import { Injectable, Logger } from '@nestjs/common';
import * as Table from 'cli-table3';

import { AuthService } from './auth.service';
import { IIssueResponse, ESeverityLevel, IIssuesDiffResponse } from '../types';
import { HttpRetryService } from '../utils';

@Injectable()
export class IssuesService {
  constructor(
    private readonly logger: Logger,
    private readonly authService: AuthService,
    private readonly httpRetryService: HttpRetryService,
  ) {}

  async getIssues(repoId: string, branchId: string) {
    try {
      const token = await this.authService.getToken();

      const response = await this.httpRetryService.axiosRef.get<IIssuesDiffResponse>(`/issues/diff/cli`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          repoId,
          branchId,
        },
      });
      return response.data;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async drawIssuesTable(issues: IIssueResponse[], magicLink?: string, message?: string) {
    const table = new Table();

    table.push([{ colSpan: 6, content: 'PR Issues', hAlign: 'center' }]);

    table.push(['№', 'Severity', 'Name', 'Dependency', 'Category', 'Fixed Version']);

    issues.forEach((issue, index) => {
      table.push(this.transformIssueToRow(issue, index));
    });

    if (magicLink) {
      console.log(`Link to more details: ${magicLink}`);
    }

    console.log(table.toString());

    if (message) {
      console.log(message);
    }
  }

  private transformIssueToRow(issue: IIssueResponse, index: number) {
    const severity = issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1).toLowerCase();
    const name = issue.name.replace(':', ': ');
    const dependency = `${issue.dependencyName}:${issue.dependencyInstalledVersion}`;
    const category = issue.category;
    const fixedVersion = issue.fixedVersion.join(', ');
    const coloredSeverity = `${issue.severity === ESeverityLevel.CRITICAL ? '🔴' : '🟠'} ${severity}`;

    return [index + 1, coloredSeverity, name, dependency, category, fixedVersion];
  }
}
