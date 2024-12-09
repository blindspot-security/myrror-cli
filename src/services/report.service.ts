import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

import { AuthService } from './auth.service';
import { HttpRetryService } from '../utils';

@Injectable()
export class ReportService {
  constructor(
    private readonly logger: Logger,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly httpRetryService: HttpRetryService,
  ) {}

  async createReport(repoId, branchId) {
    try {
      const token = await this.authService.getToken();

      const response = await this.httpRetryService.axiosRef.post<{ uuid: string }>(
        `report`,
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

  async getDownloadReportLink(reportId: string): Promise<string> {
    try {
      const token = await this.authService.getToken();
      const link = await this.httpRetryService.axiosRef.get(`/report/${reportId}/link`, {
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

  async getLinkUntilSuccess(url: string, maxExecutionTime: number, retryTime: number): Promise<string> {
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

      const response = await this.httpRetryService.axiosRef.get(url, { responseType: 'stream' });
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
