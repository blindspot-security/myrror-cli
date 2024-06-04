import { Test, TestingModule } from '@nestjs/testing';
import { RetryService } from '../../src/services/retry.service';
import axios from 'axios';
import { Logger } from '@nestjs/common';
import { AuthService, IssuesService } from '../../src/services';
import { ConfigService } from "@nestjs/config";

jest.mock('axios');

const mockConfigService = {
  get: jest.fn().mockReturnValue('someConfigValue'),
};

const mockAuthService = {
  getToken: jest.fn(),
};


describe('RetryService', () => {
  let service: RetryService;
  let logger: Logger;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RetryService,
        Logger,
        IssuesService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    service = module.get<RetryService>(RetryService);
    logger = module.get<Logger>(Logger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should retry until success', async () => {
    jest.useRealTimers(); // Use real timers in this test

    const url = 'http://example.com';
    const maxExecutionTime = 500;
    const retryTime = 100;

    const logSpy = jest.spyOn(logger, 'log');
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: {status: "pending" } });
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: {status: "completed" } });

    const processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('Process exited');
    });

    const promise = service.retryUntilSuccess(url, maxExecutionTime, retryTime);
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: {status: 'completed'} });

    // Wait for the interval to be executed twice
    await new Promise((resolve) => setTimeout(resolve, retryTime * 3));

    try {
      await promise;
    } catch (error) {
      expect(error.message).toBe('Process exited');
    }

    expect(logSpy).toHaveBeenCalledWith('status is pending');
    expect(logSpy).toHaveBeenCalledWith('status is completed');
    expect(axios.get).toHaveBeenCalledTimes(2);
    expect(processExitSpy).not.toHaveBeenCalled();
    expect(axios.get).toHaveBeenCalledTimes(2);
  });

  it('should exit process when max execution time is exceeded', async () => {
    jest.useRealTimers(); // Use real timers in this test

    const url = 'http://example.com';
    const maxExecutionTime = 300;
    const retryTime = 100;

    (axios.get as jest.Mock).mockResolvedValue({ data: { status: 'pending' } });
    const logSpy = jest.spyOn(logger, 'log');

    const processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);

    const promise = service.retryUntilSuccess(url, maxExecutionTime, retryTime);

    // Wait for the interval to be executed more than maxExecutionTime
    await new Promise((resolve) => setTimeout(resolve, maxExecutionTime * 2));

    try {
      await promise;
    } catch (error) {
      expect(error.message).toBe('Process exited');
    }

    expect(logSpy).toHaveBeenCalledWith('status is pending');
    expect(logSpy).toHaveBeenCalledWith('status is pending');
    expect(logSpy).toHaveBeenCalledWith('status is pending');

    expect(axios.get).toHaveBeenCalled();
    expect(processExitSpy).toHaveBeenCalled();
  });
});
