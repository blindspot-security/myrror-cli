import { Logger, Module } from '@nestjs/common';
import { AuthService, IssuesService, RetryService, WebhookService, ReportService } from './services';
import { StatusCommand } from './commands';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { appConfig } from './config';
import { HttpRetryModule } from './utils';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [appConfig],
      validate: (config) => {
        if (!config.MYRROR_CLIENT_ID) {
          console.error('env variable MYRROR_CLIENT_ID are not set.');
          process.exit(1);
        }
        if (!config.MYRROR_SECRET) {
          console.error('env variable MYRROR_SECRET are not set.');
          process.exit(1);
        }
        return config;
      },
    }),
    HttpRetryModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        baseURL: configService.get<string>('app.apiUrl'),
        retry: 3,
      }),
    }),
  ],
  providers: [RetryService, AuthService, IssuesService, StatusCommand, Logger, ReportService, WebhookService],
})
export class AppModule {
}
