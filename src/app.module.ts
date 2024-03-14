import { Logger, Module } from '@nestjs/common';
import { AuthService, IssuesService, RetryService } from './services';
import { StatusCommand } from './commands';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [appConfig],
      validate: (config) => {
        if (!config.MYRROR_CLIENT_ID) {
          throw new Error('env variable MYRROR_CLIENT_ID are not set. Please check the .env file.');
        }
        if (!config.MYRROR_SECRET) {
          throw new Error('env variable MYRROR_SECRET are not set. Please check the .env file.');
        }
        return config;
      },
    }),
  ],
  providers: [RetryService, AuthService, IssuesService, StatusCommand, Logger],
})
export class AppModule {}
