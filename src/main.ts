#!/usr/bin/env node

import { CommandFactory } from 'nest-commander';
import { AppModule } from './app.module';
import { InternalDisabledLogger } from './utils';

async function bootstrap() {
  await CommandFactory.run(AppModule, {
    logger: new InternalDisabledLogger(),
    cliName: 'myrror-cli',
  });
}
bootstrap();
