import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  env: process.env.NODE_ENV || 'local',
  clientId: process.env.MYRROR_CLIENT_ID,
  clientSecret: process.env.MYRROR_SECRET,
  apiUrl: process.env.MYRROR_API || 'https://api.blindspot-security.com/v1',
  timeout: process.env.MYRROR_TIMEOUT || 60 * 60 * 1000,
  retryTime: process.env.MYRROR_RETRY_TIME || 10000,
  repository: process.env.MYRROR_REPOSITORY,
  branch: process.env.MYRROR_BRANCH,
  commit: process.env.MYRROR_COMMIT,
  orgId: process.env.MYRROR_ORG_ID,
}));
