import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as Table from 'cli-table3';

import { AuthService } from './auth.service';
import { IIssueResponse, ESeverityLevel, IIssuesDiffResponse } from '../types';

@Injectable()
export class IssuesService {
  constructor(
    private logger: Logger,
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  async getIssues(repoId, branchId) {
    try {
      const url = this.configService.get<string>('app.apiUrl');
      const token = await this.authService.getToken();

      const response = await axios.get<IIssuesDiffResponse>(`${url}/issues/diff/cli`, {
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

  transformIssueToRow(issue: IIssueResponse, index: number) {
    const severity = issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1).toLowerCase();
    const name = issue.name.replace(':', ': ');
    const dependency = `${issue.dependencyName}:${issue.dependencyInstalledVersion}`;
    const category = issue.category;
    const fixedVersion = issue.fixedVersion.join(', ');
    const coloredSeverity = `${issue.severity === ESeverityLevel.CRITICAL ? '🔴' : '🟠'} ${severity}`;

    return [index + 1, coloredSeverity, name, dependency, category, fixedVersion];
  }
}
