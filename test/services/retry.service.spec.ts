import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { RetryService, IssuesService, ReportService, AuthService } from '../../src/services';
import { EScanningStatus } from '../../src/types/scanning-status.enum';
import { FriendlyStatusMessages } from '../../src/types/friendly-status-messages.const';
import { HttpRetryService } from '../../src/utils';
import { ConfigService } from '@nestjs/config';

const mockConfigService = {
  get: jest.fn().mockReturnValue('someConfigValue'),
};

const mockAuthService = {
  getToken: jest.fn(),
};

const mockReportService = {
  saveReport: jest.fn(),
};

const mockIssuesService = {
  getIssues: jest.fn(),
  drawIssuesTable: jest.fn(),
};

const mockHttpRetryService = {
  axiosRef: {
    post: jest.fn(),
    get: jest.fn(),
  },
};

const issueMock = {
  uuid: 'b42c2eaa-0533-4faf-a721-869f3ac9d4d4',
  name: "CVE-2021-23358:Improper Control of Generation of Code ('Code Injection')",
  severity: 'critical',
  category: 'vulnerability',
  dependencyName: 'underscore',
  dependencyInstalledVersion: '1.7.0',
  reachabilityStatus: 'undefined',
};

const payload = {
  repositoryName: 'repository',
  branchName: 'branch',
  commitSha: 'commit',
};

describe('RetryService', () => {
  let service: RetryService;
  let logger: Logger;
  let authService: AuthService;
  let issuesService: IssuesService;
  let reportService: ReportService;
  let httpRetryService: HttpRetryService;

  beforeAll(() => {
    process.env.MYRROR_API = 'http://localhost';
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: ReportService, useValue: mockReportService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: IssuesService, useValue: mockIssuesService },
        { provide: HttpRetryService, useValue: mockHttpRetryService },
        Logger,
        RetryService,
      ],
    }).compile();

    service = module.get<RetryService>(RetryService);
    reportService = module.get<ReportService>(ReportService);
    logger = module.get<Logger>(Logger);
    authService = module.get<AuthService>(AuthService);
    issuesService = module.get<IssuesService>(IssuesService);
    httpRetryService = module.get<HttpRetryService>(HttpRetryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should retry until success', async () => {
    jest.useRealTimers(); // Use real timers in this test

    const maxExecutionTime = 500;
    const retryTime = 100;

    const logSpy = jest.spyOn(logger, 'log');
    (httpRetryService.axiosRef.post as jest.Mock)
      .mockResolvedValueOnce({ data: { status: EScanningStatus.WAITING } })
      .mockResolvedValueOnce({ data: { status: EScanningStatus.SCANNING } })
      .mockResolvedValueOnce({ data: { status: EScanningStatus.SCANNED, repoId: 'repoId', branchId: 'branchId' } });

    (issuesService.getIssues as jest.Mock).mockResolvedValueOnce({ issues: [] });

    const processExitSpy = jest.spyOn(process, 'exit').mockImplementation((code) => {
      return code as never;
    });

    const promise = service.retryUntilSuccess('test', payload, maxExecutionTime, retryTime, false);

    // Wait for the interval to be executed twice
    await new Promise((resolve) => setTimeout(resolve, retryTime * 4));

    try {
      await promise;
    } catch (error) {
      expect(error.message).toBe('Process exited');
    }

    expect(logSpy).toHaveBeenCalledWith(FriendlyStatusMessages[EScanningStatus.WAITING]);
    expect(logSpy).toHaveBeenCalledWith(FriendlyStatusMessages[EScanningStatus.SCANNING]);
    expect(logSpy).toHaveBeenCalledWith(FriendlyStatusMessages[EScanningStatus.SCANNED]);
    expect(httpRetryService.axiosRef.post).toHaveBeenCalledTimes(3);
    expect(processExitSpy).toHaveBeenCalledWith(0);
    expect(httpRetryService.axiosRef.post).toHaveBeenCalledTimes(3);
  });

  it('should create a report when scan is completed', async () => {
    jest.useRealTimers(); // Use real timers in this test

    const url = 'https://example.com';
    const maxExecutionTime = 500;
    const retryTime = 100;

    const logSpy = jest.spyOn(logger, 'log');
    (httpRetryService.axiosRef.post as jest.Mock).mockResolvedValueOnce({
      data: {
        status: EScanningStatus.SCANNED,
        repoId: 'repoId',
        branchId: 'branchId',
      },
    });

    (issuesService.getIssues as jest.Mock).mockResolvedValueOnce({ issues: [issueMock] });

    const processExitSpy = jest.spyOn(process, 'exit').mockImplementation((code) => {
      return code as never;
    });

    const promise = service.retryUntilSuccess(url, payload, maxExecutionTime, retryTime, true);

    // Wait for the interval to be executed once
    await new Promise((resolve) => setTimeout(resolve, retryTime));

    try {
      await promise;
    } catch (error) {
      expect(error.message).toBe('Process exited');
    }

    expect(logSpy).toHaveBeenCalledWith('Scanning Completed');
    expect(reportService.saveReport).toHaveBeenCalledWith('repoId', 'branchId', maxExecutionTime, retryTime);
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  it('should exit process when status is not Scanning Completed', async () => {
    jest.useRealTimers(); // Use real timers in this test

    const url = 'https://example.com';
    const maxExecutionTime = 500;
    const retryTime = 100;

    const logSpy = jest.spyOn(logger, 'log');
    (httpRetryService.axiosRef.post as jest.Mock).mockResolvedValueOnce({ data: { status: EScanningStatus.SKIPPED } });

    const processExitSpy = jest.spyOn(process, 'exit').mockImplementation((code) => {
      return code as never;
    });

    const promise = service.retryUntilSuccess(url, payload, maxExecutionTime, retryTime, false);

    // Wait for the interval to be executed once
    await new Promise((resolve) => setTimeout(resolve, retryTime));

    try {
      await promise;
    } catch (error) {
      expect(error.message).toBe('Process exited');
    }

    expect(logSpy).toHaveBeenCalledWith(FriendlyStatusMessages[EScanningStatus.SKIPPED]);
    expect(processExitSpy).toHaveBeenCalledWith(0);
  });

  it('should draw issues table when issues are found', async () => {
    jest.useRealTimers(); // Use real timers in this test

    const url = 'https://example.com';
    const maxExecutionTime = 500;
    const retryTime = 100;

    const logSpy = jest.spyOn(logger, 'log');
    (httpRetryService.axiosRef.post as jest.Mock).mockResolvedValueOnce({
      data: {
        status: EScanningStatus.SCANNED,
        repoId: 'repoId',
        branchId: 'branchId',
      },
    });

    (issuesService.getIssues as jest.Mock).mockResolvedValueOnce({
      issues: [issueMock],
      message: 'message',
      magicLink: 'magicLink',
    });

    const processExitSpy = jest.spyOn(process, 'exit').mockImplementation((code) => {
      return code as never;
    });

    const promise = service.retryUntilSuccess(url, payload, maxExecutionTime, retryTime, false);

    // Wait for the interval to be executed once
    await new Promise((resolve) => setTimeout(resolve, retryTime));

    try {
      await promise;
    } catch (error) {
      expect(error.message).toBe('Process exited');
    }

    expect(logSpy).toHaveBeenCalledWith('Scanning Completed');
    expect(issuesService.getIssues).toHaveBeenCalledWith('repoId', 'branchId');
    expect(issuesService.drawIssuesTable).toHaveBeenCalledWith([issueMock], 'magicLink', 'message');
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  it('should exit process when max execution time is exceeded', async () => {
    jest.useRealTimers(); // Use real timers in this test

    const url = 'https://example.com';
    const payload = {
      repositoryName: 'repository',
      branchName: 'branch',
      commitSha: 'commit',
    };
    const maxExecutionTime = 300;
    const retryTime = 100;

    (httpRetryService.axiosRef.post as jest.Mock).mockResolvedValue({ data: { status: EScanningStatus.WAITING } });
    const logSpy = jest.spyOn(logger, 'log');

    const processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);

    const promise = service.retryUntilSuccess(url, payload, maxExecutionTime, retryTime, false);

    // Wait for the interval to be executed more than maxExecutionTime
    await new Promise((resolve) => setTimeout(resolve, maxExecutionTime * 2));

    try {
      await promise;
    } catch (error) {
      expect(error.message).toBe('Process exited');
    }

    expect(logSpy).toHaveBeenCalledWith('Waiting for scan to start...');
    expect(logSpy).toHaveBeenCalledWith('Waiting for scan to start...');
    expect(logSpy).toHaveBeenCalledWith('Waiting for scan to start...');

    expect(httpRetryService.axiosRef.post).toHaveBeenCalled();
    expect(processExitSpy).toHaveBeenCalled();
  });
});
