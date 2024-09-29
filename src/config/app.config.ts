import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  env: process.env.NODE_ENV || 'local',
  clientId: process.env.MYRROR_CLIENT_ID,
  clientSecret: process.env.MYRROR_SECRET,
  apiUrl: process.env.MYRROR_API || 'https://api.myrror.com/v1',
  timeout: process.env.MYRROR_TIMEOUT || 60 * 60 * 1000,
  retryTime: process.env.MYRROR_RETRY_TIME || 10000,
  repository: process.env.MYRROR_REPOSITORY,
  rootNamespace: process.env.MYRROR_ROOT_NAMESPACE,
  branch: process.env.MYRROR_BRANCH,
  commit: process.env.MYRROR_COMMIT,
  pullRequestIid: process.env.MYRROR_PULL_REQUEST_IID,
  enabledSyntheticWebhooks: process.env.MYRROR_ENABLED_SYNTHETIC_WEBHOOKS === 'true' || false,
  repoOriginId: process.env.MYRROR_REPO_ORIGIN_ID,
}));
