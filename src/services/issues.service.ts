import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as Table from 'cli-table3';

import { AuthService } from './auth.service';
import { IPaginated, IIssueResponse } from 'src/types';

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

      const response = await axios.get<IPaginated<IIssueResponse>>(`${url}/issues/diff`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          repoId,
          branchId,
          take: 100,
        },
      });
      return response.data;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async drawIssuesTable(issues: IIssueResponse[]) {
    const table = new Table();

    table.push([{ colSpan: 5, content: 'PR Issues', hAlign: 'center' }]);

    table.push(['№', 'Name', 'Severity', 'Dependency name', 'Dependency version']);

    issues.forEach((issue, index) => {
      table.push([index + 1, issue.name, issue.severity, issue.dependencyName, issue.dependencyInstalledVersion]);
    });

    console.log(table.toString());
  }
}
