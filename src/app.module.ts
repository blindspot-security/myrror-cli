import { Logger, Module } from '@nestjs/common';
import { AuthService, IssuesService, RetryService } from './services';
import { StatusCommand } from './commands';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './config';
import { ReportService } from './services/report.service';

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
          console.error('env variable MYRROR_CLIENT_ID are not set.');
          process.exit(1);
        }
        return config;
      },
    }),
  ],
  providers: [RetryService, AuthService, IssuesService, StatusCommand, Logger, ReportService],
})
export class AppModule {}
