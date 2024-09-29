import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandRunner, Command, Option } from 'nest-commander';

import { RetryService, WebhookService } from '../services';
import { CommandOptions } from '../types';
import { stringToMd5 } from '../utils';

@Command({
  name: 'status',
  options: { isDefault: true },
})
export class StatusCommand extends CommandRunner {
  constructor(
    private readonly retryService: RetryService,
    private configService: ConfigService,
    private webhookService: WebhookService,
    private logger: Logger,
  ) {
    super();
  }

  @Option({
    flags: '-r, --repository [string]',
  })
  parseRepository(value: string): string {
    return value;
  }

  @Option({
    flags: '-b, --branch [string]',
  })
  parseBranch(value: string): string {
    return value;
  }

  @Option({
    flags: '-c, --commit [string]',
  })
  parseCommit(value: string): string {
    return value;
  }

  @Option({
    flags: '-rns, --rootNamespace [string]',
    required: false,
  })
  parseRootNamespace(value: string): string {
    return value;
  }

  @Option({
    flags: '-pri, --pullRequestIid [string]',
    required: false,
  })
  parsePullRequestIid(value: string): string {
    return value;
  }

  @Option({
    flags: '-roi, --repoOriginId [string]',
    required: false,
  })
  parserRepoOriginId(value: string): string {
    return value;
  }

  @Option({
    flags: '-esw, --enabledSyntheticWebhooks [string]',
    required: false,
  })
  parseEnabledSyntheticWebhooks(value: string): boolean {
    return value === 'true';
  }

  @Option({
    flags: '-h, --help',
    description: 'Display help information',
  })
  displayHelp(): void {
    console.log(`
      Usage: npm run status -- [options]
  
      Options:
        -r, --repository [string]           Specify the repository
        -b, --branch [string]               Specify the branch
        -c, --commit [string]               Specify the commit
        -rns, --rootNamespace [string]      Specify the root namespace
        -pri, --pullRequestIid [string]     Specify the pull request iid
        -roi, --repoOriginId [string]       Specify the repo origin id
        -esw, --enabledSyntheticWebhooks    Specify if synthetic webhooks are enabled
  
      Examples:
        npm run status -r your-repository -b your-branch -c your-commit -rns your-root-namespace -pri your-pull-request-iid -roi your-repo-origin-id -esw true
    `);
    process.exit(0);
  }

  async run(passedParams: string[], options?: CommandOptions): Promise<void> {
    const url = this.configService.get<string>('app.apiUrl');
    const timeout = this.configService.get<number>('app.timeout');
    const retryTime = this.configService.get<number>('app.retryTime');
    let repository = this.configService.get<string>('app.repository') || options?.repository;
    const rootNamespace = this.configService.get<string>('app.rootNamespace') || options?.rootNamespace;
    const branch = this.configService.get<string>('app.branch') || options?.branch;
    const commit = this.configService.get<string>('app.commit') || options?.commit;
    const pullRequestIid = this.configService.get<string>('app.pullRequestIid') || options?.pullRequestIid;
    const enabledSyntheticWebhooks = this.configService.get<boolean>('app.enabledSyntheticWebhooks') || options?.enabledSyntheticWebhooks;
    const repoOriginId = this.configService.get<string>('app.repoOriginId') || options?.repoOriginId;

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

    const repositoryNameHash = stringToMd5(repository);
    const branchNameHash = stringToMd5(branch);

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

    await this.retryService.retryUntilSuccess(`${url}/repositories/${repositoryNameHash}/${branchNameHash}/${commit}/status`, timeout, retryTime);
  }
}
