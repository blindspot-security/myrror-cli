import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandRunner, Command, Option } from 'nest-commander';

import { RetryService } from '../services';
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
  
      Examples:
        npm run status -r your-repository -b your-branch -c your-commit -rns your-root-namespace
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

    await this.retryService.retryUntilSuccess(`${url}/repositories/${repositoryNameHash}/${branchNameHash}/${commit}/status`, timeout, retryTime);
  }
}
