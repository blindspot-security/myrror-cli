import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandRunner, RootCommand, Option } from 'nest-commander';

import { RetryService, WebhookService } from '../services';
import { CommandOptions } from '../types';

@RootCommand({
  name: 'status',
  description: 'Check the status of a commit',
  options: { isDefault: true },
})
export class StatusCommand extends CommandRunner {
  constructor(
    private readonly retryService: RetryService,
    private readonly configService: ConfigService,
    private readonly webhookService: WebhookService,
    private readonly logger: Logger,
  ) {
    super();
  }

  @Option({
    flags: '-r, --repository [string]',
    description: 'Specify the repository',
  })
  parseRepository(value: string): string {
    return value;
  }

  @Option({
    flags: '-b, --branch [string]',
    description: 'Specify the branch',
  })
  parseBranch(value: string): string {
    return value;
  }

  @Option({
    flags: '-c, --commit [string]',
    description: 'Specify the commit',
  })
  parseCommit(value: string): string {
    return value;
  }

  @Option({
    flags: '-rns, --rootNamespace [string]',
    description: 'Specify the root namespace',
    required: false,
  })
  parseRootNamespace(value: string): string {
    return value;
  }

  @Option({
    flags: '-pri, --pullRequestIid [string]',
    description: 'Specify the pull request iid',
    required: false,
  })
  parsePullRequestIid(value: string): string {
    return value;
  }

  @Option({
    flags: '-roi, --repoOriginId [string]',
    description: 'Specify the repo origin id',
    required: false,
  })
  parserRepoOriginId(value: string): string {
    return value;
  }

  @Option({
    flags: '-esw, --enabledSyntheticWebhooks [string]',
    description: 'Specify if synthetic webhooks are enabled',
    required: false,
  })
  parseEnabledSyntheticWebhooks(value: string): boolean {
    return value === 'true';
  }

  @Option({
    flags: '-wr, --withReport [string]',
    description: 'Specify if the report should be generated',
    required: false,
  })
  parseWithReport(value: string): boolean {
    return value === 'true';
  }

  async run(passedParams: string[], options?: CommandOptions): Promise<void> {
    const timeout = this.configService.get<number>('app.timeout');
    const retryTime = this.configService.get<number>('app.retryTime');
    let repository = this.configService.get<string>('app.repository') || options?.repository;
    const rootNamespace = this.configService.get<string>('app.rootNamespace') || options?.rootNamespace;
    const branch = this.configService.get<string>('app.branch') || options?.branch;
    const commit = this.configService.get<string>('app.commit') || options?.commit;
    const pullRequestIid = this.configService.get<string>('app.pullRequestIid') || options?.pullRequestIid;
    const enabledSyntheticWebhooks = this.configService.get<boolean>('app.enabledSyntheticWebhooks') || options?.enabledSyntheticWebhooks;
    const repoOriginId = this.configService.get<string>('app.repoOriginId') || options?.repoOriginId;
    const withReport = this.configService.get<boolean>('app.withReport') || options?.withReport;

    if (!repository) {
      this.logger.error('Please provide repository');
      throw new Error('Please provide repository');
    }

    if (!branch) {
      this.logger.error('Please provide branch');
      throw new Error('Please provide branch');
    }

    if (!commit) {
      this.logger.error('Please provide commit');
      throw new Error('Please provide commit');
    }

    if (rootNamespace) {
      const regex = new RegExp(`^${rootNamespace}/`);
      repository = repository.replace(regex, '');
    }

    if (enabledSyntheticWebhooks) {
      if (!repoOriginId) {
        this.logger.error('Please provide repoOriginId');
        throw new Error('Please provide repoOriginId');
      }

      if (!pullRequestIid) {
        this.logger.error('Please provide pullRequestIid');
        throw new Error('Please provide pullRequestIid');
      }

      await this.webhookService.sendGitlabPullRequestData({
        pullRequestIid,
        repoOriginId,
      });
    }
    const payload = {
      repositoryName: repository,
      branchName: branch,
      commitSha: commit,
    };

    await this.retryService.retryUntilSuccess(`/repositories/commit/scan/status`, payload, timeout, retryTime, withReport);
  }
}
