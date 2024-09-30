import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

import { AuthService } from './auth.service';

@Injectable()
export class ReportService {
  constructor(
    private logger: Logger,
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  async createReport(repoId, branchId) {
    try {
      const url = this.configService.get<string>('app.apiUrl');
      const token = await this.authService.getToken();

      const response = await axios.post<{ uuid: string }>(
        `${url}/report`,
        {
          type: 'cliIssues',
          filters: {
            repositories: {
              all: false,
              included: [repoId],
            },
            branches: {
              all: false,
              included: [branchId],
            },
          },
          fileType: 'csv',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async getDownloadReportLink(reportId: string) {
    try {
      const url = `${this.configService.get<string>('app.apiUrl')}/report/${reportId}/link`;
      console.log('getDownloadReportLink url: ', url);
      const token = await this.authService.getToken();
      const link = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'text',
        },
      });

      return link.data;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async getLinkUntilSuccess(url: string, maxExecutionTime: number, retryTime: number) {
    try {
      return await this.getDownloadReportLink(url);
    } catch (error) {
      this.logger.log('Report not ready yet');
      this.logger.log(`Retrying in ${retryTime / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, retryTime));
      return this.getLinkUntilSuccess(url, maxExecutionTime, retryTime);
    }
  }

  async downloadAndSaveReportFile(url: string, directory: string) {
    try {
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
      }

      const response = await axios.get(url, { responseType: 'stream' });
      const filename = 'report.csv';

      const filePath = path.join(directory, filename);
      const writer = fs.createWriteStream(filePath);

      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          console.log('File saved successfully:', filePath);
          resolve(filePath);
        });
        writer.on('error', reject);
      });
    } catch (error) {
      this.logger.error('Error downloading or saving the file:', error);
      throw error;
    }
  }

  async saveReport(repoId: string, branchId: string, maxExecutionTime: number, retryTime: number) {
    try {
      const report = await this.createReport(repoId, branchId);
      const reportId = report.uuid;

      this.logger.log(`Waiting for the report creation...`);
      await new Promise((resolve) => setTimeout(resolve, retryTime));

      const link = await this.getLinkUntilSuccess(reportId, maxExecutionTime, retryTime);
      const projectArtifactDir = this.configService.get<string>('app.projectArtifactDir') || path.join(__dirname, 'reports');
      await this.downloadAndSaveReportFile(link, projectArtifactDir);
    } catch (error) {
      this.logger.error('Error saving the report:', error);
      throw error;
    }
  }
}
