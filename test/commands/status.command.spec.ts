import { StatusCommand } from '../../src/commands/status.command';
import { RetryService } from '../../src/services/retry.service';
import { stringToMd5 } from '../../src/utils';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { CommandOptions } from 'src/types';
import { WebhookService } from 'src/services';

describe('StatusCommand', () => {
  let statusCommand: StatusCommand;
  let retryService: jest.Mocked<RetryService>;
  let configService: jest.Mocked<ConfigService>;
  let logger: jest.Mocked<Logger>;
  let webhookService: jest.Mocked<WebhookService>;

  beforeEach(() => {
    retryService = {
      retryUntilSuccess: jest.fn(),
    } as any;

    configService = {
      get: jest.fn(),
    } as any;

    logger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    } as any;

    webhookService = {
      sendGitlabPullRequestData: jest.fn(),
    } as any;

    statusCommand = new StatusCommand(retryService, configService, webhookService, logger);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should error if repository is not provided', async () => {
    configService.get.mockImplementation((key: string) => {
      switch (key) {
        case 'app.repository':
          return null;
        case 'app.branch':
          return 'branch';
        case 'app.commit':
          return 'commit';
        default:
          return null;
      }
    });

    await expect(statusCommand.run([])).rejects.toThrow('Please provide repository');
    expect(logger.error).toHaveBeenCalledWith('Please provide repository');
  });

  it('should error if branch is not provided', async () => {
    configService.get.mockImplementation((key: string) => {
      switch (key) {
        case 'app.repository':
          return 'repository';
        case 'app.branch':
          return null;
        case 'app.commit':
          return 'commit';
        default:
          return null;
      }
    });

    await expect(statusCommand.run([])).rejects.toThrow('Please provide branch');
    expect(logger.error).toHaveBeenCalledWith('Please provide branch');
  });

  it('should error if commit is not provided', async () => {
    configService.get.mockImplementation((key: string) => {
      switch (key) {
        case 'app.repository':
          return 'repository';
        case 'app.branch':
          return 'branch';
        case 'app.commit':
          return null;
        default:
          return null;
      }
    });

    await expect(statusCommand.run([])).rejects.toThrow('Please provide commit');
    expect(logger.error).toHaveBeenCalledWith('Please provide commit');
  });

  it('should error if repository is not provided', async () => {
    const options: CommandOptions = {
      repository: null,
      branch: 'branch',
      commit: 'commit',
    };

    await expect(statusCommand.run([], options)).rejects.toThrow('Please provide repository');
    expect(logger.error).toHaveBeenCalledWith('Please provide repository');
  });

  it('should error if branch is not provided', async () => {
    const options: CommandOptions = {
      repository: 'repository',
      branch: null,
      commit: 'commit',
    };

    await expect(statusCommand.run([], options)).rejects.toThrow('Please provide branch');
    expect(logger.error).toHaveBeenCalledWith('Please provide branch');
  });

  it('should error if commit is not provided', async () => {
    const options: CommandOptions = {
      repository: 'repository',
      branch: 'branch',
      commit: null,
    };

    await expect(statusCommand.run([], options)).rejects.toThrow('Please provide commit');
    expect(logger.error).toHaveBeenCalledWith('Please provide commit');
  });

  it('should error enabledSyntheticWebhooks is true and repoOriginId is not provided', async () => {
    configService.get.mockImplementation((key: string) => {
      switch (key) {
        case 'app.repository':
          return 'repository';
        case 'app.branch':
          return 'branch';
        case 'app.commit':
          return 'commit';
        case 'app.enabledSyntheticWebhooks':
          return true;
        default:
          return null;
      }
    });

    await expect(statusCommand.run([])).rejects.toThrow('Please provide repoOriginId');
    expect(logger.error).toHaveBeenCalledWith('Please provide repoOriginId');
  });

  it('should error enabledSyntheticWebhooks is true and pullRequestIid is not provided', async () => {
    configService.get.mockImplementation((key: string) => {
      switch (key) {
        case 'app.repository':
          return 'repository';
        case 'app.branch':
          return 'branch';
        case 'app.commit':
          return 'commit';
        case 'app.enabledSyntheticWebhooks':
          return true;
        case 'app.repoOriginId':
          return 'repoOriginId';
        default:
          return null;
      }
    });

    await expect(statusCommand.run([])).rejects.toThrow('Please provide pullRequestIid');
    expect(logger.error).toHaveBeenCalledWith('Please provide pullRequestIid');
  });

  it('should call sendGitlabPullRequestData with the correct parameters', async () => {
    const url = 'http://localhost';
    const timeout = 5000;
    const retryTime = 1000;
    const repository = 'repository';
    const branch = 'branch';
    const commit = 'commit';
    const pullRequestIid = 'pullRequestIid';
    const repoOriginId = 'repoOriginId';

    configService.get.mockImplementation((key: string) => {
      const configMap = {
        'app.apiUrl': url,
        'app.timeout': timeout,
        'app.retryTime': retryTime,
        'app.repository': repository,
        'app.branch': branch,
        'app.commit': commit,
        'app.pullRequestIid': pullRequestIid,
        'app.enabledSyntheticWebhooks': true,
        'app.repoOriginId': repoOriginId,
      };
      return configMap[key];
    });

    await statusCommand.run([]);

    expect(webhookService.sendGitlabPullRequestData).toHaveBeenCalledWith({
      pullRequestIid,
      repoOriginId,
    });
  });

  it('should call retryUntilSuccess with the correct parameters', async () => {
    const url = 'http://localhost';
    const timeout = 5000;
    const retryTime = 1000;
    const repository = 'repository';
    const branch = 'branch';
    const commit = 'commit';

    configService.get.mockImplementation((key: string) => {
      const configMap = {
        'app.apiUrl': url,
        'app.timeout': timeout,
        'app.retryTime': retryTime,
        'app.repository': repository,
        'app.branch': branch,
        'app.commit': commit,
      };
      return configMap[key];
    });

    await statusCommand.run([]);

    expect(retryService.retryUntilSuccess).toHaveBeenCalledWith(`${url}/repositories/${stringToMd5(repository)}/${stringToMd5(branch)}/${commit}/status`, timeout, retryTime);
  });
});
