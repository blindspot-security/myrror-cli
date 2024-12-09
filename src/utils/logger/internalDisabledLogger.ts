import { ConsoleLogger } from '@nestjs/common';
import * as process from 'node:process';
import { LogLevel } from '@nestjs/common/services/logger.service';

/**
 * A custom logger that disables all logs emitted by calling `log` method if
 * they use one of the following contexts:
 * - `InstanceLoader`
 * - `RoutesResolver`
 * - `RouterExplorer`
 * - `NestFactory`
 */
export class InternalDisabledLogger extends ConsoleLogger {
  static contextsToIgnore = [
    'InstanceLoader',
    'RoutesResolver',
    'RouterExplorer',
    'NestFactory', // I prefer not including this one
  ];

  constructor() {
    super();
    const baseLogLevels: LogLevel[] = ['log', 'warn', 'error'];
    if (process.env.MYRROR_LOG_LEVEL === 'debug') {
      baseLogLevels.push('debug');
    }
    this.setLogLevels(baseLogLevels);
  }

  log(message: any, context?: string): void {
    if (!InternalDisabledLogger.contextsToIgnore.includes(context)) {
      super.log(message, context);
    }
  }

  error(message: any, stack?: string, context?: string) {
    if (!InternalDisabledLogger.contextsToIgnore.includes(context)) {
      super.error(message, stack, context);
    }
  }

  warn(message: any, context?: string) {
    if (!InternalDisabledLogger.contextsToIgnore.includes(context)) {
      super.warn(message, context);
    }
  }

  debug(message: any, context?: string) {
    if (!InternalDisabledLogger.contextsToIgnore.includes(context)) {
      super.debug(message, context);
    }
  }

  verbose(message: any, context?: string) {
    if (!InternalDisabledLogger.contextsToIgnore.includes(context)) {
      super.verbose(message, context);
    }
  }
}
